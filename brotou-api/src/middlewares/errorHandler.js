const { Prisma } = require("@prisma/client");

/**
 * Handler global de erros, registrado como último middleware no app.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]", err);

  // Erros do Prisma.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violação de chave única.
    if (err.code === "P2002") {
      const campo = err.meta?.target;
      return res.status(409).json({
        status: "erro",
        mensagem: `Já existe um registro com esse valor no campo: ${campo}`,
      });
    }

    // Registro não encontrado (ex: FK inválida).
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "erro",
        mensagem: "Registro não encontrado",
      });
    }

    // FK inválida.
    if (err.code === "P2003") {
      return res.status(400).json({
        status: "erro",
        mensagem: "Referência inválida: o registro vinculado não existe",
      });
    }
  }

  // Erro genérico.
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    status: "erro",
    mensagem: err.message || "Erro interno do servidor",
  });
};

module.exports = errorHandler;
