const { Router } = require("express");
const ctrl = require("../controllers/admin.controller");
const validate = require("../middlewares/validate");
const { autenticarAdmin } = require("../middlewares/auth");
const {
  loginAdminSchema,
  criarAdminSchema,
  atualizarAdminSchema,
} = require("../validators/admin.validator");

const router = Router();

// Público
router.post("/login", validate(loginAdminSchema), ctrl.login);

// Protegido — exige token de admin
router.use(autenticarAdmin);

router.get("/dashboard", ctrl.dashboard);
router.get("/", ctrl.listar);
router.get("/:id", ctrl.buscarPorId);
router.post("/", validate(criarAdminSchema), ctrl.criar);
router.patch("/:id", validate(atualizarAdminSchema), ctrl.atualizar);
router.delete("/:id", ctrl.remover);

module.exports = router;
