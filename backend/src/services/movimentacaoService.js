const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { Movimentacao, Item, Fornecedor, Usuario } = require("../models");

const incluir = [
  {
    model: Item,
    as: "item",
    attributes: ["id", "codigo", "descricao", "saldoAtual", "estoqueMinimo"],
  },
  {
    model: Fornecedor,
    as: "fornecedor",
    attributes: ["id", "nome"],
    required: false,
  },
  {
    model: Usuario,
    as: "usuario",
    attributes: ["id", "nome", "perfil"],
  },
];

function erroValidacao(mensagem) {
  const error = new Error(mensagem);
  error.statusCode = 400;
  return error;
}

function dataIsoValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

  const data = new Date(`${valor}T00:00:00`);

  return (
    !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor
  );
}

function construirFiltroHistorico(query = {}) {
  const where = {};
  const itemId = Number(query.itemId);
  const tipo = String(query.tipo || "").trim();
  const dataInicio = String(query.dataInicio || "").trim();
  const dataFim = String(query.dataFim || "").trim();

  if (itemId) where.itemId = itemId;

  if (["entrada", "saida", "ajuste_entrada", "ajuste_saida"].includes(tipo)) {
    where.tipo = tipo;
  }

  if (dataInicio && !dataIsoValida(dataInicio)) {
    throw erroValidacao("Data inicial inválida.");
  }

  if (dataFim && !dataIsoValida(dataFim)) {
    throw erroValidacao("Data final inválida.");
  }

  if (dataInicio && dataFim && dataFim < dataInicio) {
    throw erroValidacao(
      "A data final deve ser igual ou posterior à data inicial.",
    );
  }

  if (dataInicio || dataFim) {
    where.criadoEm = {};

    if (dataInicio) {
      where.criadoEm[Op.gte] = new Date(`${dataInicio}T00:00:00`);
    }

    if (dataFim) {
      where.criadoEm[Op.lte] = new Date(`${dataFim}T23:59:59.999`);
    }
  }

  return where;
}

async function listarMovimentacoes(query = {}) {
  const where = construirFiltroHistorico(query);

  return Movimentacao.findAll({
    where,
    include: incluir,
    order: [
      ["criadoEm", "DESC"],
      ["id", "DESC"],
    ],
    limit: 200,
  });
}

async function registrarMovimentacao({
  itemId,
  tipo,
  quantidade,
  fornecedorId,
  usuarioId,
  justificativa,
  chaveRequisicao,
}) {
  await sequelize.query(
    `CALL sp_registrar_movimentacao(
      :itemId,
      :tipo,
      :quantidade,
      :fornecedorId,
      :usuarioId,
      :justificativa,
      :chaveRequisicao
    )`,
    {
      replacements: {
        itemId,
        tipo,
        quantidade,
        fornecedorId: fornecedorId || null,
        usuarioId,
        justificativa: justificativa || null,
        chaveRequisicao,
      },
    },
  );

  return Movimentacao.findOne({
    where: { chaveRequisicao },
    include: incluir,
  });
}

module.exports = {
  incluir,
  construirFiltroHistorico,
  listarMovimentacoes,
  registrarMovimentacao,
};
