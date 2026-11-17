const { Op } = require("sequelize");
const {
  Item,
  Movimentacao,
  TipoPastilha,
  Usuario,
  Fornecedor,
} = require("../models");

function erroValidacao(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validarDataISO(valor, campo) {
  if (!valor) return null;

  const texto = String(valor).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw erroValidacao(`${campo} deve usar o formato YYYY-MM-DD.`);
  }

  const data = new Date(`${texto}T00:00:00.000Z`);
  if (Number.isNaN(data.getTime())) {
    throw erroValidacao(`${campo} é inválida.`);
  }

  return texto;
}

function validarIdOpcional(valor, campo) {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    return null;
  }

  const texto = String(valor).trim();

  if (!/^\d+$/.test(texto)) {
    throw erroValidacao(`${campo} deve ser um número inteiro positivo.`);
  }

  const id = Number(texto);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw erroValidacao(`${campo} deve ser um número inteiro positivo.`);
  }

  return id;
}

function montarPeriodo(dataInicio, dataFim) {
  const inicio = validarDataISO(dataInicio, "dataInicio");
  const fim = validarDataISO(dataFim, "dataFim");

  if (inicio && fim && fim < inicio) {
    throw erroValidacao(
      "A data final deve ser igual ou posterior à data inicial.",
    );
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

function normalizarMovimentacao(registro) {
  const mov = registro.toJSON ? registro.toJSON() : registro;

  return {
    id: Number(mov.id),
    criadoEm: mov.criadoEm,
    tipo: mov.tipo,
    quantidade: Number(mov.quantidade),
    saldoAnterior: Number(mov.saldoAnterior),
    saldoPosterior: Number(mov.saldoPosterior),
    justificativa: mov.justificativa || null,
    item: mov.item
      ? {
          id: Number(mov.item.id ?? mov.itemId),
          codigo: mov.item.codigo,
          descricao: mov.item.descricao,
          tipo: mov.item.tipo
            ? {
                id: Number(mov.item.tipo.id),
                nome: mov.item.tipo.nome,
              }
            : null,
        }
      : null,
    usuario: mov.usuario
      ? {
          id: Number(mov.usuario.id),
          nome: mov.usuario.nome,
          perfil: mov.usuario.perfil,
        }
      : null,
    fornecedor: mov.fornecedor
      ? {
          id: Number(mov.fornecedor.id),
          nome: mov.fornecedor.nome,
        }
      : null,
  };
}

async function obterResumoRelatorios({
  dataInicio,
  dataFim,
  itemId,
  tipoPastilhaId,
} = {}) {
  const itemIdValidado = validarIdOpcional(itemId, "itemId");
  const tipoPastilhaIdValidado = validarIdOpcional(
    tipoPastilhaId,
    "tipoPastilhaId",
  );

  const whereMovimentacoes = {
    ...montarPeriodo(dataInicio, dataFim),
  };

  if (itemIdValidado) {
    whereMovimentacoes.itemId = itemIdValidado;
  }

  const includeItem = {
    model: Item,
    as: "item",
    attributes: ["id", "codigo", "descricao", "tipoId"],
    required: Boolean(tipoPastilhaIdValidado),
    include: [
      {
        model: TipoPastilha,
        as: "tipo",
        attributes: ["id", "nome"],
        required: false,
      },
    ],
  };

  if (tipoPastilhaIdValidado) {
    includeItem.where = { tipoId: tipoPastilhaIdValidado };
  }

  const [itens, movimentacoes] = await Promise.all([
    Item.findAll({
      where: { ativo: true },
      attributes: ["id", "codigo", "descricao", "saldoAtual", "estoqueMinimo"],
      order: [["codigo", "ASC"]],
    }),
    Movimentacao.findAll({
      where: whereMovimentacoes,
      include: [
        includeItem,
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nome", "perfil"],
          required: false,
        },
        {
          model: Fornecedor,
          as: "fornecedor",
          attributes: ["id", "nome"],
          required: false,
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
  const movimentacoesDetalhadas = movimentacoes.map(normalizarMovimentacao);

  for (const mov of movimentacoesDetalhadas) {
    const quantidade = Number(mov.quantidade);

    if (["entrada", "ajuste_entrada"].includes(mov.tipo)) {
      totalEntradas += quantidade;
    }

    if (["saida", "ajuste_saida"].includes(mov.tipo)) {
      totalSaidas += quantidade;

      const idItem = mov.item?.id;
      if (!idItem) continue;

      const atual = consumo.get(idItem) || {
        itemId: idItem,
        codigo: mov.item.codigo || String(idItem),
        descricao: mov.item.descricao || "",
        tipoPastilha: mov.item.tipo || null,
        quantidadeSaida: 0,
      };

      atual.quantidadeSaida += quantidade;
      consumo.set(idItem, atual);
    }
  }

  const consumoPorItem = [...consumo.values()].sort(
    (a, b) =>
      b.quantidadeSaida - a.quantidadeSaida || a.codigo.localeCompare(b.codigo),
  );

  return {
    filtros: {
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      itemId: itemIdValidado,
      tipoPastilhaId: tipoPastilhaIdValidado,
    },
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
      totalMovimentacoes: movimentacoesDetalhadas.length,
      totalEntradas,
      totalSaidas,
    },
    estoqueAtual,
    consumoPorItem,
    movimentacoesDetalhadas,
    itensParaReposicao,
  };
}

module.exports = {
  obterResumoRelatorios,
  montarPeriodo,
  situacaoEstoque,
  validarIdOpcional,
  normalizarMovimentacao,
};
