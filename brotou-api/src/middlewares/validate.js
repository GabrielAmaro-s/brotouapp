/**
 * Middleware genérico de validação com Zod.
 * Uso: router.post("/", validate(schema), controller)
 * Pode validar body, params ou query separadamente.
 */

const validate =
  (schema, target = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const erros = result.error.errors.map((e) => ({
        campo: e.path.join("."),
        mensagem: e.message,
      }));

      return res.status(400).json({
        status: "erro",
        mensagem: "Dados inválidos",
        erros,
      });
    }

    // Substitui req[target] pelos dados já transformados pelo Zod
    req[target] = result.data;
    next();
  };

module.exports = validate;
