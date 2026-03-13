const { Router } = require("express");
const ctrl = require("../controllers/planta.controller");
const validate = require("../middlewares/validate");
const {
  criarPlantaSchema,
  atualizarPlantaSchema,
} = require("../validators/planta.validator");

const router = Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);
router.post("/", validate(criarPlantaSchema), ctrl.criar);
router.patch("/:id", validate(atualizarPlantaSchema), ctrl.atualizar);
router.delete("/:id", ctrl.remover);

module.exports = router;
