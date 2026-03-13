const prisma = require("../lib/prisma");

const includeCompleto = {
  planta: { select: { id: true, apelido: true, urlFoto: true } },
  autor: { select: { id: true, nome: true, urlAvatar: true } },
};

// GET /entradas
const listar = async (req, res, next) => {
  try {
    const { plantaId, autorId, tipo } = req.query;

    const where = {};
    if (plantaId) where.plantaId = plantaId;
    if (autorId) where.autorId = autorId;
    if (tipo) where.tipo = tipo;

    const entradas = await prisma.entradaDiario.findMany({
      where,
      include: includeCompleto,
      orderBy: { registradoEm: "desc" },
    });

    return res.json({ status: "ok", total: entradas.length, dados: entradas });
  } catch (err) {
    next(err);
  }
};

// GET /entradas/:id
const buscarPorId = async (req, res, next) => {
  try {
    const entrada = await prisma.entradaDiario.findUnique({
      where: { id: req.params.id },
      include: includeCompleto,
    });

    if (!entrada) {
      return res.status(404).json({ status: "erro", mensagem: "Entrada não encontrada" });
    }

    return res.json({ status: "ok", dados: entrada });
  } catch (err) {
    next(err);
  }
};

// POST /entradas
const criar = async (req, res, next) => {
  try {
    // Verificar se a planta existe
    const planta = await prisma.planta.findUnique({ where: { id: req.body.plantaId } });
    if (!planta) {
      return res.status(404).json({ status: "erro", mensagem: "Planta não encontrada" });
    }

    const entrada = await prisma.entradaDiario.create({
      data: req.body,
      include: includeCompleto,
    });

    return res.status(201).json({ status: "ok", dados: entrada });
  } catch (err) {
    next(err);
  }
};

// PATCH /entradas/:id
const atualizar = async (req, res, next) => {
  try {
    const entrada = await prisma.entradaDiario.update({
      where: { id: req.params.id },
      data: req.body,
      include: includeCompleto,
    });

    return res.json({ status: "ok", dados: entrada });
  } catch (err) {
    next(err);
  }
};

// DELETE /entradas/:id
const remover = async (req, res, next) => {
  try {
    await prisma.entradaDiario.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
