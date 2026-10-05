const { Router } = require("express");
const healthRoutes = require("./healthRoutes");

const routes = Router();

routes.use("/health", healthRoutes);

module.exports = routes;
