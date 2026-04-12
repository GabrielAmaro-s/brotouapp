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
  plantaId: z.string().min(1, "plantaId inválido"),
  cuidadorId: z.string().min(1, "cuidadorId inválido"),
  mensagemCliente: z.string().max(800, "Mensagem muito longa").optional(),
});

const atualizarAdocaoSchema = z.object({
  dataFim: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de fim inválida")
    .optional(),
  status: statusAdocaoEnum.optional(),
  respostaAdmin: z.string().max(800, "Resposta muito longa").optional(),
  mensagemCliente: z.string().max(800, "Mensagem muito longa").optional(),
  emailEnviadoEm: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de e-mail inválida")
    .optional(),
  confirmadaEm: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data de confirmação inválida")
    .optional(),
});

const filtroAdocaoSchema = z.object({
  plantaId: z.string().min(1).optional(),
  cuidadorId: z.string().min(1).optional(),
  status: statusAdocaoEnum.optional(),
});

module.exports = { criarAdocaoSchema, atualizarAdocaoSchema, filtroAdocaoSchema };
