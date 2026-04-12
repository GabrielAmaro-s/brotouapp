const { Router } = require("express");
const ctrl = require("../controllers/planta.controller");
const validate = require("../middlewares/validate");
const { autenticarUsuarioOuAdmin } = require("../middlewares/auth");
const {
  criarPlantaSchema,
  atualizarPlantaSchema,
} = require("../validators/planta.validator");

const router = Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);
router.post("/", autenticarUsuarioOuAdmin, validate(criarPlantaSchema), ctrl.criar);
router.patch("/:id", autenticarUsuarioOuAdmin, validate(atualizarPlantaSchema), ctrl.atualizar);
router.delete("/:id", autenticarUsuarioOuAdmin, ctrl.remover);

module.exports = router;
