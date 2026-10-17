const { Router } = require("express");
const controller = require("../controllers/estoqueController");
const { autenticarToken } = require("../middlewares/authMiddleware");

const router = Router();

router.use(autenticarToken);
router.get("/alertas", controller.alertas);
router.get("/indicadores", controller.indicadores);

module.exports = router;
