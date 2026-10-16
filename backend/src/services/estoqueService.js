const { Item } = require("../models");

function normalizarItem(item) {
  const dados = typeof item.toJSON === "function" ? item.toJSON() : item;
  const saldoAtual = Number(dados.saldoAtual ?? 0);
  const estoqueMinimo = Number(dados.estoqueMinimo ?? 0);

  return {
    ...dados,
    saldoAtual,
    estoqueMinimo,
    situacaoEstoque: saldoAtual === 0 ? "sem_estoque" : "critico",
  };
}

async function listarAlertasEstoque() {
  const itens = await Item.findAll({
    where: { ativo: true },
    order: [["codigo", "ASC"]],
  });

  return itens
    .map(normalizarItem)
    .filter((item) => item.saldoAtual <= item.estoqueMinimo);
}

module.exports = { listarAlertasEstoque };
