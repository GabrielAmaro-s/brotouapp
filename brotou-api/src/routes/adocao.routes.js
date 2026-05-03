const { Router } = require("express");
const ctrl = require("../controllers/adocao.controller");
const validate = require("../middlewares/validate");
const { autenticarAdmin, autenticarUsuarioOuAdmin } = require("../middlewares/auth");
const {
  criarAdocaoSchema,
  atualizarAdocaoSchema,
} = require("../validators/adocao.validator");

const router = Router();

router.get("/", autenticarUsuarioOuAdmin, ctrl.listar);
router.get("/:id", autenticarUsuarioOuAdmin, ctrl.buscarPorId);
router.post("/", autenticarUsuarioOuAdmin, validate(criarAdocaoSchema), ctrl.criar);
router.patch("/:id", autenticarUsuarioOuAdmin, validate(atualizarAdocaoSchema), ctrl.atualizar);
router.patch("/:id/aceitar", autenticarUsuarioOuAdmin, ctrl.aceitar);
router.patch("/:id/confirmar", autenticarAdmin, ctrl.confirmar);
router.patch("/:id/responder", autenticarAdmin, ctrl.responder);
router.patch("/:id/enviar-email", autenticarAdmin, ctrl.enviarEmail);
router.patch("/:id/concluir", autenticarUsuarioOuAdmin, ctrl.concluir);
router.delete("/:id", autenticarUsuarioOuAdmin, ctrl.remover);

module.exports = router;
