const { Op } = require("sequelize");
const { Item, Movimentacao } = require("../models");

function validarDataISO(valor, campo) {
  if (!valor) return null;

  const texto = String(valor).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const error = new Error(`${campo} deve usar o formato YYYY-MM-DD.`);
    error.statusCode = 400;
    throw error;
  }

  const data = new Date(`${texto}T00:00:00.000Z`);
  if (Number.isNaN(data.getTime())) {
    const error = new Error(`${campo} é inválida.`);
    error.statusCode = 400;
    throw error;
  }

  return texto;
}

function montarPeriodo(dataInicio, dataFim) {
  const inicio = validarDataISO(dataInicio, "dataInicio");
  const fim = validarDataISO(dataFim, "dataFim");

  if (inicio && fim && fim < inicio) {
    const error = new Error(
      "A data final deve ser igual ou posterior à data inicial.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!inicio && !fim) return {};

  const intervalo = {};
  if (inicio) intervalo[Op.gte] = new Date(`${inicio}T00:00:00.000Z`);
  if (fim) intervalo[Op.lte] = new Date(`${fim}T23:59:59.999Z`);

  return { criadoEm: intervalo };
}

function situacaoEstoque(item) {
  const saldo = Number(item.saldoAtual);
  const minimo = Number(item.estoqueMinimo);

  if (saldo === 0) return "sem_estoque";
  if (saldo <= minimo) return "critico";
  return "normal";
}

async function obterResumoRelatorios({ dataInicio, dataFim } = {}) {
  const whereMovimentacoes = montarPeriodo(dataInicio, dataFim);

  const [itens, movimentacoes] = await Promise.all([
    Item.findAll({
      where: { ativo: true },
      attributes: ["id", "codigo", "descricao", "saldoAtual", "estoqueMinimo"],
      order: [["codigo", "ASC"]],
    }),
    Movimentacao.findAll({
      where: whereMovimentacoes,
      include: [
        {
          model: Item,
          as: "item",
          attributes: ["id", "codigo", "descricao"],
        },
      ],
      order: [
        ["criadoEm", "DESC"],
        ["id", "DESC"],
      ],
    }),
  ]);

  const estoqueAtual = itens.map((item) => {
    const plain = item.toJSON ? item.toJSON() : item;
    return {
      ...plain,
      saldoAtual: Number(plain.saldoAtual),
      estoqueMinimo: Number(plain.estoqueMinimo),
      situacaoEstoque: situacaoEstoque(plain),
    };
  });

  const itensParaReposicao = estoqueAtual.filter(
    (item) => item.saldoAtual <= item.estoqueMinimo,
  );

  let totalEntradas = 0;
  let totalSaidas = 0;
  const consumo = new Map();

  for (const registro of movimentacoes) {
    const mov = registro.toJSON ? registro.toJSON() : registro;
    const quantidade = Number(mov.quantidade);

    if (mov.tipo === "entrada") totalEntradas += quantidade;
    if (mov.tipo === "saida") {
      totalSaidas += quantidade;
      const itemId = Number(mov.itemId);
      const atual = consumo.get(itemId) || {
        itemId,
        codigo: mov.item?.codigo || String(itemId),
        descricao: mov.item?.descricao || "",
        quantidadeSaida: 0,
      };
      atual.quantidadeSaida += quantidade;
      consumo.set(itemId, atual);
    }
  }

  const consumoPorItem = [...consumo.values()].sort(
    (a, b) =>
      b.quantidadeSaida - a.quantidadeSaida || a.codigo.localeCompare(b.codigo),
  );

  return {
    periodo: {
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
    },
    indicadores: {
      totalItensAtivos: estoqueAtual.length,
      saldoTotal: estoqueAtual.reduce(
        (soma, item) => soma + item.saldoAtual,
        0,
      ),
      itensParaReposicao: itensParaReposicao.length,
      semEstoque: estoqueAtual.filter((item) => item.saldoAtual === 0).length,
      totalMovimentacoes: movimentacoes.length,
      totalEntradas,
      totalSaidas,
    },
    estoqueAtual,
    consumoPorItem,
    itensParaReposicao,
  };
}

module.exports = {
  obterResumoRelatorios,
  montarPeriodo,
  situacaoEstoque,
};
