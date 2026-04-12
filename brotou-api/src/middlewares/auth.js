const jwt = require("jsonwebtoken");

/**
 * Middleware de autenticação para usuários comuns.
 * Espera header: Authorization: Bearer <token>
 */
const autenticarUsuario = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "erro",
      mensagem: "Token de autenticação não fornecido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    req.usuarioEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({
      status: "erro",
      mensagem: "Token inválido ou expirado",
    });
  }
};

/**
 * Middleware de autenticação para administradores.
 * Espera header: Authorization: Bearer <token-admin>
 */
const autenticarAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "erro",
      mensagem: "Token de administrador não fornecido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    req.adminId = payload.id;
    req.adminEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({
      status: "erro",
      mensagem: "Token de administrador inválido ou expirado",
    });
  }
};

/**
 * Permite autenticar com token de usuário OU de admin.
 */
const autenticarUsuarioOuAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "erro",
      mensagem: "Token de autenticação não fornecido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payloadUsuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payloadUsuario.id;
    req.usuarioEmail = payloadUsuario.email;
    req.authTipo = "usuario";
    return next();
  } catch {}

  try {
    const payloadAdmin = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    req.adminId = payloadAdmin.id;
    req.adminEmail = payloadAdmin.email;
    req.authTipo = "admin";
    return next();
  } catch {
    return res.status(401).json({
      status: "erro",
      mensagem: "Token inválido ou expirado",
    });
  }
};

module.exports = { autenticarUsuario, autenticarAdmin, autenticarUsuarioOuAdmin };
