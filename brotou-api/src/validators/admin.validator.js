const { z } = require("zod");

const loginAdminSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const criarAdminSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const atualizarAdminSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.string().email("E-mail inválido").optional(),
  senha: z.string().min(6).optional(),
});

module.exports = { loginAdminSchema, criarAdminSchema, atualizarAdminSchema };
