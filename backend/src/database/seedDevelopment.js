const sequelize = require("../config/database");
const {
  TipoPastilha,
  Fabricante,
  Fornecedor,
  LocalArmazenamento,
  Item,
} = require("../models");

async function main() {
  await sequelize.authenticate();

  const [tipo] = await TipoPastilha.findOrCreate({
    where: { nome: "Torneamento" },
    defaults: {
      descricao: "Pastilhas para operações de torneamento.",
      ativo: true,
    },
  });

  const [fabricante] = await Fabricante.findOrCreate({
    where: { nome: "Fabricante Demonstração" },
    defaults: { contato: "Cadastro local para desenvolvimento.", ativo: true },
  });

  const [fornecedor] = await Fornecedor.findOrCreate({
    where: { nome: "Fornecedor Demonstração" },
    defaults: { contato: "Cadastro local para desenvolvimento.", ativo: true },
  });

  const [local] = await LocalArmazenamento.findOrCreate({
    where: { nome: "Armário A" },
    defaults: { descricao: "Local inicial de desenvolvimento.", ativo: true },
  });

  await Item.findOrCreate({
    where: { codigo: "PT-E3-001" },
    defaults: {
      descricao: "Pastilha de demonstração da Etapa 3",
      tipoId: tipo.id,
      fabricanteId: fabricante.id,
      localId: local.id,
      estoqueMinimo: 5,
      saldoAtual: 0,
      ativo: true,
    },
  });

  console.log(`Dados locais prontos. Fornecedor: ${fornecedor.nome}`);
  await sequelize.close();
}

main().catch(async (error) => {
  console.error(error.message);
  await sequelize.close();
  process.exitCode = 1;
});
