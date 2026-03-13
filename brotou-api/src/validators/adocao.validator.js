const { z } = require("zod");

const statusAdocaoEnum = z.enum(["PENDENTE", "ATIVA", "CONCLUIDA"], {
  errorMap: () => ({ message: "Status deve ser PENDENTE, ATIVA ou CONCLUIDA" }),
});

const criarAdocaoSchema = z.object({
  dataInicio: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de início inválida"),
  dataFim: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de fim inválida")
    .optional(),
  plantaId: z.string().cuid("plantaId inválido"),
  cuidadorId: z.string().cuid("cuidadorId inválido"),
});

const atualizarAdocaoSchema = z.object({
  dataFim: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de fim inválida")
    .optional(),
  status: statusAdocaoEnum.optional(),
});

const filtroAdocaoSchema = z.object({
  plantaId: z.string().cuid().optional(),
  cuidadorId: z.string().cuid().optional(),
  status: statusAdocaoEnum.optional(),
});

module.exports = { criarAdocaoSchema, atualizarAdocaoSchema, filtroAdocaoSchema };
