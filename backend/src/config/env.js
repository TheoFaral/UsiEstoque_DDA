const dotenv = require("dotenv");

dotenv.config();

const parsedPort = Number.parseInt(process.env.PORT || "3000", 10);

if (Number.isNaN(parsedPort)) {
  throw new Error("A variável PORT deve conter um número inteiro.");
}

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsedPort,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
});

module.exports = env;
