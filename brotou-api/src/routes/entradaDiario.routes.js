const { Router } = require("express");
const ctrl = require("../controllers/entradaDiario.controller");
const validate = require("../middlewares/validate");
const {
  criarEntradaSchema,
  atualizarEntradaSchema,
} = require("../validators/entradaDiario.validator");

const router = Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);
router.post("/", validate(criarEntradaSchema), ctrl.criar);
router.patch("/:id", validate(atualizarEntradaSchema), ctrl.atualizar);
router.delete("/:id", ctrl.remover);

module.exports = router;
