const { Router } = require("express");
const controller = require("../controllers/movimentacaoController");
const {
  autenticarToken,
  exigirPerfil,
} = require("../middlewares/authMiddleware");

const router = Router();

router.use(autenticarToken);
router.get("/catalogos", controller.catalogos);
router.get("/", controller.listar);
router.post(
  "/",
  exigirPerfil("administrador", "operador"),
  controller.registrar,
);

module.exports = router;
