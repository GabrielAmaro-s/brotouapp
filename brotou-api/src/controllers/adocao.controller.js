const prisma = require("../lib/prisma");

const includeCompleto = {
  planta: {
    include: {
      especie: true,
      dono: { select: { id: true, nome: true, email: true, urlAvatar: true } },
    },
  },
  cuidador: { select: { id: true, nome: true, email: true, urlAvatar: true } },
};

// GET /adocoes
const listar = async (req, res, next) => {
  try {
    const { plantaId, cuidadorId, donoId, status, comResposta } = req.query;

    const where = {};
    if (plantaId) where.plantaId = plantaId;
    if (cuidadorId) where.cuidadorId = cuidadorId;
    if (status) where.status = status;
    if (donoId) where.planta = { donoId };
    if (comResposta === "true") where.respostaAdmin = { not: null };
    if (comResposta === "false") where.respostaAdmin = null;

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
        cuidadorId: req.body.cuidadorId,
        mensagemCliente: req.body.mensagemCliente,
      },
      include: includeCompleto,
    });

    return res.status(201).json({ status: "ok", dados: adocao });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id
const atualizar = async (req, res, next) => {
  try {
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
    const adocao = await prisma.adocao.update({
      where: { id: req.params.id },
      data: { emailEnviadoEm: new Date() },
      include: includeCompleto,
    });

    return res.json({
      status: "ok",
      mensagem: `E-mail registrado como enviado para ${adocao.cuidador?.email || "cliente"}`,
      dados: adocao,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /adocoes/:id/concluir
const concluir = async (req, res, next) => {
  try {
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
