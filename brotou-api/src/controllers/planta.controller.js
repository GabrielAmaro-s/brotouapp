const prisma = require("../lib/prisma");
const mailService = require("../services/mail.service");

const includeCompleto = {
  dono: { select: { id: true, nome: true, email: true, urlAvatar: true } },
  especie: true,
  admin: { select: { id: true, nome: true, email: true } },
  _count: { select: { entradasDiario: true, adocoes: true } },
};

const enviarEmailPlantaCriada = async (planta) => {
  if (!planta.dono?.email) return;

  try {
    await mailService.enviarEmail({
      to: planta.dono.email,
      subject: `Sua planta ${planta.apelido} foi cadastrada no Brotou`,
      text: [
        `Olá, ${planta.dono.nome || "cliente"}!`,
        "",
        `A planta "${planta.apelido}" foi cadastrada com sucesso no Brotou.`,
        planta.especie?.nomeComum ? `Espécie: ${planta.especie.nomeComum}` : null,
        planta.disponivelParaAdocao
          ? "Ela está marcada como disponível para adoção."
          : "Ela está cadastrada como privada no seu jardim.",
        "",
        "Acesse o Brotou para acompanhar seu jardim.",
      ].filter(Boolean).join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #243024; line-height: 1.5;">
          <h2 style="color: #2d4a22;">Planta cadastrada no Brotou</h2>
          <p>Olá, ${planta.dono.nome || "cliente"}!</p>
          <p>A planta <strong>${planta.apelido}</strong> foi cadastrada com sucesso.</p>
          ${planta.especie?.nomeComum ? `<p><strong>Espécie:</strong> ${planta.especie.nomeComum}</p>` : ""}
          <p>${planta.disponivelParaAdocao ? "Ela está marcada como disponível para adoção." : "Ela está cadastrada como privada no seu jardim."}</p>
          <p>Acesse o Brotou para acompanhar seu jardim.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[MAIL] Falha ao enviar e-mail de planta cadastrada:", err.message);
  }
};

// GET /plantas
const listar = async (req, res, next) => {
  try {
    const { donoId, especieId, disponivelParaAdocao, dificuldade, adminId } = req.query;

    const where = {};
    if (donoId) where.donoId = donoId;
    if (especieId) where.especieId = especieId;
    if (adminId) where.adminId = adminId;
    if (disponivelParaAdocao !== undefined) {
      where.disponivelParaAdocao = disponivelParaAdocao === "true";
    }
    if (dificuldade) {
      where.especie = { dificuldade };
    }

    const plantas = await prisma.planta.findMany({
      where,
      include: includeCompleto,
      orderBy: { adquiridaEm: "desc" },
    });

    return res.json({ status: "ok", total: plantas.length, dados: plantas });
  } catch (err) {
    next(err);
  }
};

// GET /plantas/:id
const buscarPorId = async (req, res, next) => {
  try {
    const planta = await prisma.planta.findUnique({
      where: { id: req.params.id },
      include: {
        ...includeCompleto,
        entradasDiario: {
          include: { autor: { select: { id: true, nome: true, urlAvatar: true } } },
          orderBy: { registradoEm: "desc" },
        },
        adocoes: {
          include: { cuidador: { select: { id: true, nome: true, urlAvatar: true } } },
          orderBy: { dataInicio: "desc" },
        },
      },
    });

    if (!planta) {
      return res.status(404).json({ status: "erro", mensagem: "Planta não encontrada" });
    }

    return res.json({ status: "ok", dados: planta });
  } catch (err) {
    next(err);
  }
};

// POST /plantas
const criar = async (req, res, next) => {
  try {
    const dados = {
      ...req.body,
      donoId: req.authTipo === "usuario" ? req.usuarioId : req.body.donoId,
      adminId: req.authTipo === "admin" ? req.body.adminId : undefined,
    };

    const planta = await prisma.planta.create({
      data: dados,
      include: includeCompleto,
    });

    enviarEmailPlantaCriada(planta);

    return res.status(201).json({ status: "ok", dados: planta });
  } catch (err) {
    next(err);
  }
};

// PATCH /plantas/:id
const atualizar = async (req, res, next) => {
  try {
    const planta = await prisma.planta.update({
      where: { id: req.params.id },
      data: req.body,
      include: includeCompleto,
    });

    return res.json({ status: "ok", dados: planta });
  } catch (err) {
    next(err);
  }
};

// DELETE /plantas/:id
const remover = async (req, res, next) => {
  try {
    const planta = await prisma.planta.findUnique({
      where: { id: req.params.id },
      select: { donoId: true },
    });

    if (!planta) {
      return res.status(404).json({ status: "erro", mensagem: "Planta não encontrada" });
    }

    if (req.authTipo !== "admin" && planta.donoId !== req.usuarioId) {
      return res.status(403).json({ status: "erro", mensagem: "Apenas o dono pode excluir esta planta" });
    }

    await prisma.planta.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
