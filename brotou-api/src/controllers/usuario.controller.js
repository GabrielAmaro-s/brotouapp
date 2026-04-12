const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

const includeBasico = {
  admin: { select: { id: true, nome: true, email: true } },
  _count: { select: { plantas: true, entradasDiario: true, adocoes: true } },
};

const normalizarUsername = (valor) => String(valor || "").trim().toLowerCase();

// GET /usuarios
const listar = async (req, res, next) => {
  try {
    const { adminId, busca, username, excluirId } = req.query;

    const filtros = [];

    if (adminId) filtros.push({ adminId });
    if (excluirId) filtros.push({ id: { not: excluirId } });

    if (username) {
      filtros.push({
        username: {
          equals: normalizarUsername(username),
          mode: "insensitive",
        },
      });
    }

    if (busca) {
      filtros.push({
        OR: [
          { nome: { contains: busca, mode: "insensitive" } },
          { email: { contains: busca, mode: "insensitive" } },
          { username: { contains: busca, mode: "insensitive" } },
        ],
      });
    }

    const where = filtros.length > 0 ? { AND: filtros } : {};

    const usuarios = await prisma.usuario.findMany({
      where,
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
    const { nome, username, email, urlAvatar, adminId } = req.body;

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        username: normalizarUsername(username),
        email,
        urlAvatar,
        adminId,
      },
      include: includeBasico,
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({ status: "ok", dados: usuario, token });
  } catch (err) {
    next(err);
  }
};

// PATCH /usuarios/:id
const atualizar = async (req, res, next) => {
  try {
    const dados = { ...req.body };
    if (dados.username) dados.username = normalizarUsername(dados.username);

    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data: dados,
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

// POST /usuarios/login
const login = async (req, res, next) => {
  try {
    const identificador = String(
      req.body.identificador || req.body.email || req.body.username || "",
    ).trim();

    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: identificador.includes("@")
          ? [{ email: { equals: identificador, mode: "insensitive" } }]
          : [
              { username: { equals: normalizarUsername(identificador), mode: "insensitive" } },
              { email: { equals: identificador, mode: "insensitive" } },
            ],
      },
      include: includeBasico,
    });

    if (!usuario) {
      return res.status(404).json({ status: "erro", mensagem: "Usuário não encontrado" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({ status: "ok", dados: usuario, token });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover, login };
