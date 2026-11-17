const { Router } = require("express");
const { showHealth } = require("../controllers/healthController");

const healthRoutes = Router();

healthRoutes.get("/", showHealth);

module.exports = healthRoutes;
