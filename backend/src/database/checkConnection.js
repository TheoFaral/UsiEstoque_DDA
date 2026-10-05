const sequelize = require("../config/database");

const obrigatorias = [
  "usuarios",
  "tipos_pastilha",
  "fabricantes",
  "fornecedores",
  "locais_armazenamento",
  "itens",
  "movimentacoes",
];

async function main() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query("SHOW TABLES");
    const encontradas = new Set(rows.map((r) => Object.values(r)[0]));
    const faltantes = obrigatorias.filter((nome) => !encontradas.has(nome));
    if (faltantes.length)
      throw new Error(`Tabelas ausentes: ${faltantes.join(", ")}`);
    console.log("Conexão MySQL OK. Esquema usiestoque_V2 validado.");
  } finally {
    await sequelize.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
