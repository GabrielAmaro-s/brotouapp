const { Router } = require("express");
const ctrl = require("../controllers/usuario.controller");
const validate = require("../middlewares/validate");
const {
  criarUsuarioSchema,
  atualizarUsuarioSchema,
  loginUsuarioSchema,
} = require("../validators/usuario.validator");

const router = Router();

router.get("/", ctrl.listar);
router.post("/login", validate(loginUsuarioSchema), ctrl.login);
router.get("/:id", ctrl.buscarPorId);
router.post("/", validate(criarUsuarioSchema), ctrl.criar);
router.patch("/:id", validate(atualizarUsuarioSchema), ctrl.atualizar);
router.delete("/:id", ctrl.remover);

module.exports = router;
