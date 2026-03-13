const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /admins/login
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ status: "erro", mensagem: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) {
      return res.status(401).json({ status: "erro", mensagem: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || "1d" }
    );

    const { senha: _, ...adminSemSenha } = admin;
    return res.json({ status: "ok", token, admin: adminSemSenha });
  } catch (err) {
    next(err);
  }
};

// GET /admins
const listar = async (req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, nome: true, email: true, criadoEm: true },
      orderBy: { criadoEm: "desc" },
    });
    return res.json({ status: "ok", dados: admins });
  } catch (err) {
    next(err);
  }
};

// GET /admins/:id
const buscarPorId = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
        _count: { select: { usuarios: true, plantas: true } },
      },
    });

    if (!admin) {
      return res.status(404).json({ status: "erro", mensagem: "Admin não encontrado" });
    }

    return res.json({ status: "ok", dados: admin });
  } catch (err) {
    next(err);
  }
};

// POST /admins
const criar = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);

    const admin = await prisma.admin.create({
      data: { nome, email, senha: senhaHash },
      select: { id: true, nome: true, email: true, criadoEm: true },
    });

    return res.status(201).json({ status: "ok", dados: admin });
  } catch (err) {
    next(err);
  }
};

// PATCH /admins/:id
const atualizar = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;
    const dados = {};

    if (nome) dados.nome = nome;
    if (email) dados.email = email;
    if (senha) dados.senha = await bcrypt.hash(senha, 10);

    const admin = await prisma.admin.update({
      where: { id: req.params.id },
      data: dados,
      select: { id: true, nome: true, email: true, criadoEm: true },
    });

    return res.json({ status: "ok", dados: admin });
  } catch (err) {
    next(err);
  }
};

// DELETE /admins/:id
const remover = async (req, res, next) => {
  try {
    await prisma.admin.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// GET /admins/dashboard — métricas gerais
const dashboard = async (req, res, next) => {
  try {
    const [totalUsuarios, totalPlantas, totalEspecies, totalAdocoes, totalEntradas] =
      await Promise.all([
        prisma.usuario.count(),
        prisma.planta.count(),
        prisma.especie.count(),
        prisma.adocao.count(),
        prisma.entradaDiario.count(),
      ]);

    const adocoesPorStatus = await prisma.adocao.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const entradasPorTipo = await prisma.entradaDiario.groupBy({
      by: ["tipo"],
      _count: { tipo: true },
    });

    const plantasPorDificuldade = await prisma.especie.groupBy({
      by: ["dificuldade"],
      _count: { dificuldade: true },
    });

    return res.json({
      status: "ok",
      dados: {
        totais: {
          usuarios: totalUsuarios,
          plantas: totalPlantas,
          especies: totalEspecies,
          adocoes: totalAdocoes,
          entradas: totalEntradas,
        },
        adocoesPorStatus: adocoesPorStatus.map((a) => ({
          status: a.status,
          total: a._count.status,
        })),
        entradasPorTipo: entradasPorTipo.map((e) => ({
          tipo: e.tipo,
          total: e._count.tipo,
        })),
        plantasPorDificuldade: plantasPorDificuldade.map((p) => ({
          dificuldade: p.dificuldade,
          total: p._count.dificuldade,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, listar, buscarPorId, criar, atualizar, remover, dashboard };
