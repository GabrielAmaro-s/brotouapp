const { Router } = require("express");
const ctrl = require("../controllers/amizade.controller");
const validate = require("../middlewares/validate");
const { autenticarUsuario } = require("../middlewares/auth");
const { criarAmizadeSchema } = require("../validators/amizade.validator");

const router = Router();

router.use(autenticarUsuario);

router.get("/", ctrl.listar);
router.post("/", validate(criarAmizadeSchema), ctrl.solicitar);
router.patch("/:id/aceitar", ctrl.aceitar);
router.patch("/:id/recusar", ctrl.recusar);
router.delete("/:id", ctrl.remover);

module.exports = router;
