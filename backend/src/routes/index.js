const { Router } = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const itemRoutes = require("./itemRoutes");
const movimentacaoRoutes = require("./movimentacaoRoutes");
const estoqueRoutes = require("./estoqueRoutes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/usuarios", userRoutes);
router.use("/itens", itemRoutes);
router.use("/movimentacoes", movimentacaoRoutes);
router.use("/estoque", estoqueRoutes);

module.exports = router;
