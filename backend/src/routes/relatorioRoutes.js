const { Router } = require("express");
const controller = require("../controllers/relatorioController");
const { autenticarToken } = require("../middlewares/authMiddleware");

const router = Router();

router.use(autenticarToken);
router.get("/resumo", controller.resumo);

module.exports = router;
