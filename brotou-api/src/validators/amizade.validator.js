const { z } = require("zod");

const statusAmizadeEnum = z.enum(["PENDENTE", "ACEITA", "RECUSADA"], {
  errorMap: () => ({ message: "Status deve ser PENDENTE, ACEITA ou RECUSADA" }),
});

const criarAmizadeSchema = z.object({
  destinatarioId: z.string().min(1, "destinatarioId inválido"),
});

const filtroAmizadeSchema = z.object({
  tipo: z.enum(["todas", "rede", "recebidas", "enviadas"]).optional(),
  status: statusAmizadeEnum.optional(),
});

module.exports = { criarAmizadeSchema, filtroAmizadeSchema, statusAmizadeEnum };
