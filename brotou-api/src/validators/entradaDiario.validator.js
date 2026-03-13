const { z } = require("zod");

const tipoEntradaEnum = z.enum(["REGA", "ADUBACAO", "PODA", "OBSERVACAO"], {
  errorMap: () => ({ message: "Tipo deve ser REGA, ADUBACAO, PODA ou OBSERVACAO" }),
});

const criarEntradaSchema = z.object({
  tipo: tipoEntradaEnum,
  observacao: z.string().max(1000, "Observação muito longa").optional(),
  registradoEm: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Data inválida")
    .optional(),
  plantaId: z.string().cuid("plantaId inválido"),
  autorId: z.string().cuid("autorId inválido"),
});

const atualizarEntradaSchema = z.object({
  tipo: tipoEntradaEnum.optional(),
  observacao: z.string().max(1000).optional(),
});

const filtroEntradaSchema = z.object({
  plantaId: z.string().cuid().optional(),
  autorId: z.string().cuid().optional(),
  tipo: tipoEntradaEnum.optional(),
});

module.exports = { criarEntradaSchema, atualizarEntradaSchema, filtroEntradaSchema };
