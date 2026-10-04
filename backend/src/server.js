const app = require("./app");
const env = require("./config/env");

const server = app.listen(env.port, () => {
  console.log(`UsiEstoque DDA API disponível na porta ${env.port}`);
});

function shutdown(signal) {
  console.log(`${signal} recebido. Encerrando a API...`);

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
