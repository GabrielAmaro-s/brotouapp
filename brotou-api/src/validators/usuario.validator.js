const { z } = require("zod");

const criarUsuarioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  email: z.string().email("E-mail inválido"),
  urlAvatar: z.string().url("URL do avatar inválida").optional().or(z.literal("")),
  adminId: z.string().cuid("adminId inválido").optional(),
});

const atualizarUsuarioSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.string().email("E-mail inválido").optional(),
  urlAvatar: z.string().url("URL do avatar inválida").optional().or(z.literal("")),
  adminId: z.string().cuid("adminId inválido").nullable().optional(),
});

const idParamSchema = z.object({
  id: z.string().cuid("ID inválido"),
});

module.exports = { criarUsuarioSchema, atualizarUsuarioSchema, idParamSchema };
