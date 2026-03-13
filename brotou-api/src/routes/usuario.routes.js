const { Router } = require("express");
const ctrl = require("../controllers/usuario.controller");
const validate = require("../middlewares/validate");
const {
  criarUsuarioSchema,
  atualizarUsuarioSchema,
} = require("../validators/usuario.validator");

const router = Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);
router.post("/", validate(criarUsuarioSchema), ctrl.criar);
router.patch("/:id", validate(atualizarUsuarioSchema), ctrl.atualizar);
router.delete("/:id", ctrl.remover);

module.exports = router;
