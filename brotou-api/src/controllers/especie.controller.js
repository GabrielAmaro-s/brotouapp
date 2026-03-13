const prisma = require("../lib/prisma");

// GET /especies
const listar = async (req, res, next) => {
  try {
    const { dificuldade } = req.query;

    const especies = await prisma.especie.findMany({
      where: dificuldade ? { dificuldade } : {},
      include: { _count: { select: { plantas: true } } },
      orderBy: { nomeComum: "asc" },
    });

    return res.json({ status: "ok", total: especies.length, dados: especies });
  } catch (err) {
    next(err);
  }
};

// GET /especies/:id
const buscarPorId = async (req, res, next) => {
  try {
    const especie = await prisma.especie.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { plantas: true } },
        plantas: {
          include: { dono: { select: { id: true, nome: true } } },
          take: 10,
        },
      },
    });

    if (!especie) {
      return res.status(404).json({ status: "erro", mensagem: "Espécie não encontrada" });
    }

    return res.json({ status: "ok", dados: especie });
  } catch (err) {
    next(err);
  }
};

// POST /especies
const criar = async (req, res, next) => {
  try {
    const especie = await prisma.especie.create({ data: req.body });
    return res.status(201).json({ status: "ok", dados: especie });
  } catch (err) {
    next(err);
  }
};

// PATCH /especies/:id
const atualizar = async (req, res, next) => {
  try {
    const especie = await prisma.especie.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ status: "ok", dados: especie });
  } catch (err) {
    next(err);
  }
};

// DELETE /especies/:id
const remover = async (req, res, next) => {
  try {
    await prisma.especie.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
