const { Router } = require("express");
const { listar, criar } = require("../controllers/userController");
const {
  autenticarToken,
  exigirPerfil,
} = require("../middlewares/authMiddleware");

const router = Router();
router.use(autenticarToken, exigirPerfil("administrador"));
router.get("/", listar);
router.post("/", criar);
module.exports = router;
