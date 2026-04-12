const { Router } = require("express");
const ctrl = require("../controllers/entradaDiario.controller");
const validate = require("../middlewares/validate");
const { autenticarUsuarioOuAdmin } = require("../middlewares/auth");
const {
  criarEntradaSchema,
  atualizarEntradaSchema,
} = require("../validators/entradaDiario.validator");

const router = Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);
router.post("/", autenticarUsuarioOuAdmin, validate(criarEntradaSchema), ctrl.criar);
router.patch("/:id", autenticarUsuarioOuAdmin, validate(atualizarEntradaSchema), ctrl.atualizar);
router.delete("/:id", autenticarUsuarioOuAdmin, ctrl.remover);

module.exports = router;
