const { Router } = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const itemRoutes = require("./itemRoutes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/usuarios", userRoutes);
router.use("/itens", itemRoutes);

module.exports = router;
