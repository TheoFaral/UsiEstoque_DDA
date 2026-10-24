const { Router } = require("express");
const controller = require("../controllers/userController");
const {
  autenticarToken,
  exigirPerfil,
} = require("../middlewares/authMiddleware");
const router = Router();
router.use(autenticarToken, exigirPerfil("administrador"));
router.get("/", controller.listar);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.patch("/:id/inativar", controller.inativar);
module.exports = router;
