const { z } = require("zod");

const criarPlantaSchema = z.object({
  apelido: z.string().min(1, "Apelido é obrigatório").max(100),
  urlFoto: z.string().url("URL da foto inválida").optional().or(z.literal("")),
  adquiridaEm: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de aquisição inválida"),
  disponivelParaAdocao: z.boolean().default(false),
  donoId: z.string().cuid("donoId inválido"),
  especieId: z.string().cuid("especieId inválido"),
  adminId: z.string().cuid("adminId inválido").optional(),
});

const atualizarPlantaSchema = z.object({
  apelido: z.string().min(1).max(100).optional(),
  urlFoto: z.string().url("URL da foto inválida").optional().or(z.literal("")),
  adquiridaEm: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de aquisição inválida")
    .optional(),
  disponivelParaAdocao: z.boolean().optional(),
  especieId: z.string().cuid("especieId inválido").optional(),
  adminId: z.string().cuid("adminId inválido").nullable().optional(),
});

const filtroPlantaSchema = z.object({
  donoId: z.string().cuid().optional(),
  especieId: z.string().cuid().optional(),
  disponivelParaAdocao: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  dificuldade: z.enum(["FACIL", "MEDIO", "DIFICIL"]).optional(),
});

module.exports = { criarPlantaSchema, atualizarPlantaSchema, filtroPlantaSchema };
