const { Router } = require("express");
const controller = require("../controllers/cadastroController");
const {
  autenticarToken,
  exigirPerfil,
} = require("../middlewares/authMiddleware");
const router = Router();
router.use(autenticarToken, exigirPerfil("administrador"));
router.get("/:categoria", controller.listar);
router.post("/:categoria", controller.criar);
router.put("/:categoria/:id", controller.atualizar);
router.patch("/:categoria/:id/inativar", controller.inativar);
module.exports = router;
