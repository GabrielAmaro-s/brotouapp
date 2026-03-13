const prisma = require("../lib/prisma");

const includeBasico = {
  admin: { select: { id: true, nome: true, email: true } },
  _count: { select: { plantas: true, entradasDiario: true, adocoes: true } },
};

// GET /usuarios
const listar = async (req, res, next) => {
  try {
    const { adminId } = req.query;

    const usuarios = await prisma.usuario.findMany({
      where: adminId ? { adminId } : {},
      include: includeBasico,
      orderBy: { criadoEm: "desc" },
    });

    return res.json({ status: "ok", total: usuarios.length, dados: usuarios });
  } catch (err) {
    next(err);
  }
};

// GET /usuarios/:id
const buscarPorId = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.params.id },
      include: {
        ...includeBasico,
        plantas: {
          include: { especie: true },
          orderBy: { adquiridaEm: "desc" },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ status: "erro", mensagem: "Usuário não encontrado" });
    }

    return res.json({ status: "ok", dados: usuario });
  } catch (err) {
    next(err);
  }
};

// POST /usuarios
const criar = async (req, res, next) => {
  try {
    const { nome, email, urlAvatar, adminId } = req.body;

    const usuario = await prisma.usuario.create({
      data: { nome, email, urlAvatar, adminId },
      include: includeBasico,
    });

    return res.status(201).json({ status: "ok", dados: usuario });
  } catch (err) {
    next(err);
  }
};

// PATCH /usuarios/:id
const atualizar = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data: req.body,
      include: includeBasico,
    });

    return res.json({ status: "ok", dados: usuario });
  } catch (err) {
    next(err);
  }
};

// DELETE /usuarios/:id
const remover = async (req, res, next) => {
  try {
    await prisma.usuario.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
