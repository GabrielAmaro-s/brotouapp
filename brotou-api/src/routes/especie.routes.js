const { Router } = require("express");
const ctrl = require("../controllers/especie.controller");
const validate = require("../middlewares/validate");
const { autenticarAdmin } = require("../middlewares/auth");
const {
  criarEspecieSchema,
  atualizarEspecieSchema,
} = require("../validators/especie.validator");

const router = Router();

// Leitura é pública
router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);

// Escrita exige admin
router.post("/", autenticarAdmin, validate(criarEspecieSchema), ctrl.criar);
router.patch("/:id", autenticarAdmin, validate(atualizarEspecieSchema), ctrl.atualizar);
router.delete("/:id", autenticarAdmin, ctrl.remover);

module.exports = router;
