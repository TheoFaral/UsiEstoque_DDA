const { Router } = require("express");
const controller = require("../controllers/itemController");
const {
  autenticarToken,
  exigirPerfil,
} = require("../middlewares/authMiddleware");

const router = Router();

router.use(autenticarToken);

router.get("/catalogos", controller.catalogos);
router.get("/", controller.listar);

router.post("/", exigirPerfil("administrador"), controller.criar);

router.put("/:id", exigirPerfil("administrador"), controller.atualizar);

router.patch(
  "/:id/inativar",
  exigirPerfil("administrador"),
  controller.inativar,
);

module.exports = router;
