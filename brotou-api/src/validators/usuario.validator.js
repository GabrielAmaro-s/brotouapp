const { z } = require("zod");

const usernameSchema = z
  .string()
  .min(3, "Username deve ter no mínimo 3 caracteres")
  .max(24, "Username deve ter no máximo 24 caracteres")
  .regex(/^[a-z0-9._]+$/i, "Username deve conter apenas letras, números, ponto ou underline");

const senhaSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(128, "Senha deve ter no máximo 128 caracteres")
  .regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula")
  .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "Senha deve conter ao menos um número");

const criarUsuarioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  username: usernameSchema,
  email: z.string().email("E-mail inválido"),
  senha: senhaSchema,
  urlAvatar: z.string().url("URL do avatar inválida").optional().or(z.literal("")),
  adminId: z.string().min(1, "adminId inválido").optional(),
});

const atualizarUsuarioSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  username: usernameSchema.optional(),
  email: z.string().email("E-mail inválido").optional(),
  senha: senhaSchema.optional(),
  urlAvatar: z.string().url("URL do avatar inválida").optional().or(z.literal("")),
  adminId: z.string().min(1, "adminId inválido").nullable().optional(),
});

const loginUsuarioSchema = z.object({
  identificador: z.string().min(1, "Informe e-mail ou username").optional(),
  email: z.string().email("E-mail inválido").optional(),
  username: usernameSchema.optional(),
  senha: z.string().min(1, "Informe a senha"),
}).refine((data) => Boolean(data.identificador || data.email || data.username), {
  message: "Informe e-mail ou username",
});

const idParamSchema = z.object({
  id: z.string().min(1, "ID inválido"),
});

module.exports = { criarUsuarioSchema, atualizarUsuarioSchema, loginUsuarioSchema, idParamSchema, usernameSchema };
