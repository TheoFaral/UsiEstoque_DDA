const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const routes = require("./routes");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
  }),
);
app.use(express.json({ limit: "1mb" }));

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
