const prisma = require("../lib/prisma");

const includeBasico = {
  solicitante: {
    select: {
      id: true,
      nome: true,
      username: true,
      email: true,
      urlAvatar: true,
    },
  },
  destinatario: {
    select: {
      id: true,
      nome: true,
      username: true,
      email: true,
      urlAvatar: true,
    },
  },
};

const listar = async (req, res, next) => {
  try {
    const usuarioId = req.usuarioId;
    const { tipo = "todas", status } = req.query;

    const where = {
      OR: [{ solicitanteId: usuarioId }, { destinatarioId: usuarioId }],
    };

    if (tipo === "rede") {
      where.status = "ACEITA";
    } else if (tipo === "recebidas") {
      where.OR = undefined;
      where.destinatarioId = usuarioId;
    } else if (tipo === "enviadas") {
      where.OR = undefined;
      where.solicitanteId = usuarioId;
    }

    if (status) {
      where.status = status;
    }

    const amizades = await prisma.amizade.findMany({
      where,
      include: includeBasico,
      orderBy: { criadoEm: "desc" },
    });

    return res.json({ status: "ok", total: amizades.length, dados: amizades });
  } catch (err) {
    next(err);
  }
};

const solicitar = async (req, res, next) => {
  try {
    const solicitanteId = req.usuarioId;
    const { destinatarioId } = req.body;

    if (solicitanteId === destinatarioId) {
      return res.status(400).json({ status: "erro", mensagem: "Você não pode adicionar a si mesmo" });
    }

    const destinatario = await prisma.usuario.findUnique({ where: { id: destinatarioId } });
    if (!destinatario) {
      return res.status(404).json({ status: "erro", mensagem: "Usuário não encontrado" });
    }

    const existente = await prisma.amizade.findFirst({
      where: {
        OR: [
          { solicitanteId, destinatarioId },
          { solicitanteId: destinatarioId, destinatarioId: solicitanteId },
        ],
      },
    });

    if (existente) {
      if (existente.status === "ACEITA") {
        return res.status(409).json({ status: "erro", mensagem: "Vocês já são amigos" });
      }
      if (existente.status === "RECUSADA") {
        await prisma.amizade.delete({ where: { id: existente.id } });
      } else {
        return res.status(409).json({ status: "erro", mensagem: "Já existe uma solicitação de amizade entre esses usuários" });
      }
    }

    const amizade = await prisma.amizade.create({
      data: {
        solicitanteId,
        destinatarioId,
      },
      include: includeBasico,
    });

    return res.status(201).json({ status: "ok", dados: amizade });
  } catch (err) {
    next(err);
  }
};

const aceitar = async (req, res, next) => {
  try {
    const amizade = await prisma.amizade.findUnique({ where: { id: req.params.id } });

    if (!amizade) {
      return res.status(404).json({ status: "erro", mensagem: "Solicitação de amizade não encontrada" });
    }

    if (amizade.destinatarioId !== req.usuarioId) {
      return res.status(403).json({ status: "erro", mensagem: "Apenas o destinatário pode aceitar" });
    }

    const atualizada = await prisma.amizade.update({
      where: { id: req.params.id },
      data: { status: "ACEITA", respondidoEm: new Date() },
      include: includeBasico,
    });

    return res.json({ status: "ok", dados: atualizada });
  } catch (err) {
    next(err);
  }
};

const recusar = async (req, res, next) => {
  try {
    const amizade = await prisma.amizade.findUnique({ where: { id: req.params.id } });

    if (!amizade) {
      return res.status(404).json({ status: "erro", mensagem: "Solicitação de amizade não encontrada" });
    }

    if (amizade.destinatarioId !== req.usuarioId) {
      return res.status(403).json({ status: "erro", mensagem: "Apenas o destinatário pode recusar" });
    }

    const atualizada = await prisma.amizade.update({
      where: { id: req.params.id },
      data: { status: "RECUSADA", respondidoEm: new Date() },
      include: includeBasico,
    });

    return res.json({ status: "ok", dados: atualizada });
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    const amizade = await prisma.amizade.findUnique({ where: { id: req.params.id } });

    if (!amizade) {
      return res.status(404).json({ status: "erro", mensagem: "Amizade não encontrada" });
    }

    const ehSolicitante = amizade.solicitanteId === req.usuarioId;
    const ehDestinatario = amizade.destinatarioId === req.usuarioId;

    if (!ehSolicitante && !ehDestinatario) {
      return res.status(403).json({ status: "erro", mensagem: "Você não pode remover esta amizade" });
    }

    await prisma.amizade.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, solicitar, aceitar, recusar, remover };
