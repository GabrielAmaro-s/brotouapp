const { Router } = require("express");
const ctrl = require("../controllers/adocao.controller");
const validate = require("../middlewares/validate");
const {
  criarAdocaoSchema,
  atualizarAdocaoSchema,
} = require("../validators/adocao.validator");

const router = Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);
router.post("/", validate(criarAdocaoSchema), ctrl.criar);
router.patch("/:id", validate(atualizarAdocaoSchema), ctrl.atualizar);
router.patch("/:id/aceitar", ctrl.aceitar);
router.patch("/:id/concluir", ctrl.concluir);
router.delete("/:id", ctrl.remover);

module.exports = router;
