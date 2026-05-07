const prisma = require("../lib/prisma");

const mailService = require("../services/mail.service");

const includeCompleto = {
  planta: {
    include: {
      especie: true,
      dono: { select: { id: true, nome: true, email: true, urlAvatar: true } },
    },
  },
  cuidador: { select: { id: true, nome: true, email: true, urlAvatar: true } },
};

const buscarInteracaoParaAcao = async (id) => prisma.adocao.findUnique({
  where: { id },
  include: {
    planta: { select: { donoId: true } },
  },
});

const usuarioPodeGerenciar = (req, adocao) => (
  req.authTipo === "admin" ||
  adocao?.cuidadorId === req.usuarioId ||
  adocao?.planta?.donoId === req.usuarioId
);

const enviarEmailAdocaoCriada = async (adocao) => {
  const emails = [];
  const planta = adocao.planta;
  const cuidador = adocao.cuidador;
  const dono = planta?.dono;
  const nomePlanta = planta?.apelido || "Brotou";

  if (cuidador?.email) {
    emails.push(() => mailService.enviarEmail({
      to: cuidador.email,
      subject: `Solicitação recebida para ${nomePlanta}`,
      text: [
        `Olá, ${cuidador.nome || "cliente"}!`,
        "",
        `Recebemos sua solicitação de adoção/interação para "${nomePlanta}".`,
        `Status: ${adocao.status}`,
        adocao.mensagemCliente ? `Sua mensagem: ${adocao.mensagemCliente}` : null,
        "",
        "A equipe ou o dono da planta vai acompanhar sua solicitação pelo Brotou.",
      ].filter(Boolean).join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #243024; line-height: 1.5;">
          <h2 style="color: #2d4a22;">Solicitação recebida</h2>
          <p>Olá, ${cuidador.nome || "cliente"}!</p>
          <p>Recebemos sua solicitação de adoção/interação para <strong>${nomePlanta}</strong>.</p>
          <p><strong>Status:</strong> ${adocao.status}</p>
          ${adocao.mensagemCliente ? `<p><strong>Sua mensagem:</strong> ${adocao.mensagemCliente}</p>` : ""}
          <p>A equipe ou o dono da planta vai acompanhar sua solicitação pelo Brotou.</p>
        </div>
      `,
    }));
  }

  if (dono?.email && dono.email !== cuidador?.email) {
    emails.push(() => mailService.enviarEmail({
      to: dono.email,
      subject: `Nova solicitação para ${nomePlanta}`,
      text: [
        `Olá, ${dono.nome || "cliente"}!`,
        "",
        `${cuidador?.nome || "Um usuário"} enviou uma solicitação de adoção/interação para "${nomePlanta}".`,
        cuidador?.email ? `E-mail do solicitante: ${cuidador.email}` : null,
        adocao.mensagemCliente ? `Mensagem: ${adocao.mensagemCliente}` : null,
        "",
        "Acesse o Brotou para acompanhar essa interação.",
      ].filter(Boolean).join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #243024; line-height: 1.5;">
          <h2 style="color: #2d4a22;">Nova solicitação no Brotou</h2>
          <p>Olá, ${dono.nome || "cliente"}!</p>
          <p>${cuidador?.nome || "Um usuário"} enviou uma solicitação de adoção/interação para <strong>${nomePlanta}</strong>.</p>
          ${cuidador?.email ? `<p><strong>E-mail do solicitante:</strong> ${cuidador.email}</p>` : ""}
          ${adocao.mensagemCliente ? `<p><strong>Mensagem:</strong> ${adocao.mensagemCliente}</p>` : ""}
          <p>Acesse o Brotou para acompanhar essa interação.</p>
        </div>
      `,
    }));
  }

  let enviados = 0;

  for (const enviar of emails) {
    try {
      await enviar();
      enviados += 1;
    } catch (err) {
      console.error("[MAIL] Falha ao enviar e-mail de adoção criada:", err.message);
    }
  }

  return enviados > 0;
};

const negarSeNaoPodeGerenciar = async (req, res) => {
  const adocao = await buscarInteracaoParaAcao(req.params.id);

  if (!adocao) {
    res.status(404).json({ status: "erro", mensagem: "Adoção não encontrada" });
    return null;
  }

  if (!usuarioPodeGerenciar(req, adocao)) {
    res.status(403).json({ status: "erro", mensagem: "Acesso negado à interação" });
    return null;
  }

  return adocao;
};

// GET /adocoes
const listar = async (req, res, next) => {
  try {
    const { plantaId, cuidadorId, donoId, status, comResposta } = req.query;

    const filtros = [];
    if (plantaId) filtros.push({ plantaId });
    if (cuidadorId) filtros.push({ cuidadorId });
    if (status) filtros.push({ status });
    if (donoId) filtros.push({ planta: { donoId } });
    if (comResposta === "true") filtros.push({ respostaAdmin: { not: null } });
    if (comResposta === "false") filtros.push({ respostaAdmin: null });

    if (req.authTipo === "usuario") {
      filtros.push({
        OR: [
          { cuidadorId: req.usuarioId },
          { planta: { donoId: req.usuarioId } },
        ],
      });
    }

    const where = filtros.length > 0 ? { AND: filtros } : {};

    const adocoes = await prisma.adocao.findMany({
      where,
      include: includeCompleto,
      orderBy: { dataInicio: "desc" },
    });

    return res.json({ status: "ok", total: adocoes.length, dados: adocoes });
  } catch (err) {
    next(err);
  }
};

// GET /adocoes/:id
const buscarPorId = async (req, res, next) => {
  try {
    const adocao = await prisma.adocao.findUnique({
      where: { id: req.params.id },
      include: includeCompleto,
    });

    if (!adocao) {
      return res.status(404).json({ status: "erro", mensagem: "Adoção não encontrada" });
    }

    if (
      req.authTipo === "usuario" &&
      adocao.cuidadorId !== req.usuarioId &&
      adocao.planta?.dono?.id !== req.usuarioId
    ) {
      return res.status(403).json({ status: "erro", mensagem: "Acesso negado à interação" });
    }

    return res.json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// POST /adocoes
const criar = async (req, res, next) => {
  try {
    // Verifica se a planta está disponível para adoção.
    const planta = await prisma.planta.findUnique({
      where: { id: req.body.plantaId },
    });

    if (!planta) {
      return res.status(404).json({ status: "erro", mensagem: "Planta não encontrada" });
    }

    if (!planta.disponivelParaAdocao) {
      return res.status(400).json({
        status: "erro",
        mensagem: "Esta planta não está disponível para adoção",
      });
    }

    // Impede mais de uma adoção ativa para o mesmo item.
    const adocaoAtiva = await prisma.adocao.findFirst({
      where: { plantaId: req.body.plantaId, status: "ATIVA" },
    });

    if (adocaoAtiva) {
      return res.status(409).json({
        status: "erro",
        mensagem: "Esta planta já possui uma adoção ativa",
      });
    }

    const adocao = await prisma.adocao.create({
      data: {
        dataInicio: req.body.dataInicio,
        dataFim: req.body.dataFim,
        plantaId: req.body.plantaId,
        cuidadorId: req.authTipo === "usuario" ? req.usuarioId : req.body.cuidadorId,
        mensagemCliente: req.body.mensagemCliente,
      },
      include: includeCompleto,
    });

    const emailEnviado = await enviarEmailAdocaoCriada(adocao);

    if (emailEnviado) {
      const adocaoAtualizada = await prisma.adocao.update({
        where: { id: adocao.id },
        data: { emailEnviadoEm: new Date() },
        include: includeCompleto,
      });

      return res.status(201).json({ status: "ok", dados: adocaoAtualizada });
    }

    return res.status(201).json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id
const atualizar = async (req, res, next) => {
  try {
    const atual = await negarSeNaoPodeGerenciar(req, res);
    if (!atual) return;

    const adocao = await prisma.adocao.update({
      where: { id: req.params.id },
      data: req.body,
      include: includeCompleto,
    });

    return res.json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id/aceitar
const aceitar = async (req, res, next) => {
  try {
    const atual = await negarSeNaoPodeGerenciar(req, res);
    if (!atual) return;

    const adocao = await prisma.adocao.update({
      where: { id: req.params.id },
      data: { status: "ATIVA", confirmadaEm: new Date() },
      include: includeCompleto,
    });

    return res.json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id/confirmar
const confirmar = async (req, res, next) => {
  try {
    const atual = await prisma.adocao.findUnique({ where: { id: req.params.id } });

    if (!atual) {
      return res.status(404).json({ status: "erro", mensagem: "Adoção não encontrada" });
    }

    const adocao = await prisma.adocao.update({
      where: { id: req.params.id },
      data: {
        confirmadaEm: new Date(),
        status: atual.status === "PENDENTE" ? "ATIVA" : atual.status,
      },
      include: includeCompleto,
    });

    return res.json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id/responder
const responder = async (req, res, next) => {
  try {
    const { respostaAdmin } = req.body;

    if (!respostaAdmin || !String(respostaAdmin).trim()) {
      return res.status(400).json({ status: "erro", mensagem: "Resposta do admin é obrigatória" });
    }

    const adocao = await prisma.adocao.update({
      where: { id: req.params.id },
      data: { respostaAdmin: String(respostaAdmin).trim() },
      include: includeCompleto,
    });

    return res.json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id/enviar-email
const enviarEmail = async (req, res, next) => {
  try {
    const atual = await prisma.adocao.findUnique({
      where: { id: req.params.id },
      include: includeCompleto,
    });

    if (!atual) {
      return res.status(404).json({ status: "erro", mensagem: "Adoção não encontrada" });
    }

    if (!atual.cuidador?.email) {
      return res.status(400).json({ status: "erro", mensagem: "Interação sem e-mail do cliente" });
    }

    const resposta = atual.respostaAdmin || "Sua solicitação foi recebida e está sendo acompanhada pela equipe.";
    const assunto = "Atualização sobre sua interação no Brotou";

    const infoEmail = await mailService.enviarEmail({
      to: atual.cuidador.email,
      subject: assunto,
      text: [
        `Olá, ${atual.cuidador.nome || "cliente"}!`,
        "",
        `Temos uma atualização sobre sua interação com o item "${atual.planta?.apelido || "Brotou"}".`,
        "",
        `Status: ${atual.status}`,
        `Resposta da equipe: ${resposta}`,
        "",
        "Acesse o Brotou para acompanhar suas interações.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #243024; line-height: 1.5;">
          <h2 style="color: #2d4a22;">Atualização no Brotou</h2>
          <p>Olá, ${atual.cuidador.nome || "cliente"}!</p>
          <p>Temos uma atualização sobre sua interação com o item <strong>${atual.planta?.apelido || "Brotou"}</strong>.</p>
          <p><strong>Status:</strong> ${atual.status}</p>
          <p><strong>Resposta da equipe:</strong> ${resposta}</p>
          <p>Acesse o Brotou para acompanhar suas interações.</p>
        </div>
      `,
    });

    const adocao = await prisma.adocao.update({
      where: { id: req.params.id },
      data: { emailEnviadoEm: new Date() },
      include: includeCompleto,
    });

    return res.json({
      status: "ok",
      mensagem: `E-mail enviado para ${adocao.cuidador?.email || "cliente"}`,
      email: {
        messageId: infoEmail.messageId,
        accepted: infoEmail.accepted,
      },
      dados: adocao,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id/concluir
const concluir = async (req, res, next) => {
  try {
    const atual = await negarSeNaoPodeGerenciar(req, res);
    if (!atual) return;

    const adocao = await prisma.adocao.update({
      where: { id: req.params.id },
      data: { status: "CONCLUIDA", dataFim: new Date() },
      include: includeCompleto,
    });

    return res.json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// DELETE /adocoes/:id
const remover = async (req, res, next) => {
  try {
    const atual = await negarSeNaoPodeGerenciar(req, res);
    if (!atual) return;

    await prisma.adocao.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  aceitar,
  confirmar,
  responder,
  enviarEmail,
  concluir,
  remover,
};
