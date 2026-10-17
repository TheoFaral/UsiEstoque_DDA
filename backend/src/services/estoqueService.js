const { Item } = require("../models");

function normalizarItem(item) {
  const dados = typeof item.toJSON === "function" ? item.toJSON() : item;
  const saldoAtual = Number(dados.saldoAtual ?? 0);
  const estoqueMinimo = Number(dados.estoqueMinimo ?? 0);

  let situacaoEstoque = "normal";
  if (saldoAtual === 0) situacaoEstoque = "sem_estoque";
  else if (saldoAtual <= estoqueMinimo) situacaoEstoque = "critico";

  return {
    ...dados,
    saldoAtual,
    estoqueMinimo,
    situacaoEstoque,
  };
}

async function carregarItensAtivos() {
  const itens = await Item.findAll({
    where: { ativo: true },
    order: [["codigo", "ASC"]],
  });

  return itens.map(normalizarItem);
}

async function listarAlertasEstoque() {
  const itens = await carregarItensAtivos();
  return itens.filter((item) => item.saldoAtual <= item.estoqueMinimo);
}

async function obterIndicadoresEstoque() {
  const itens = await carregarItensAtivos();

  const semEstoque = itens.filter((item) => item.saldoAtual === 0).length;
  const criticos = itens.filter(
    (item) => item.saldoAtual > 0 && item.saldoAtual <= item.estoqueMinimo,
  ).length;
  const normais = itens.filter(
    (item) => item.saldoAtual > item.estoqueMinimo,
  ).length;
  const saldoTotal = itens.reduce((total, item) => total + item.saldoAtual, 0);

  return {
    totalItensAtivos: itens.length,
    semEstoque,
    criticos,
    normais,
    saldoTotal,
  };
}

module.exports = {
  listarAlertasEstoque,
  obterIndicadoresEstoque,
};
