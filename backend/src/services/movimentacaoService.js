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
  { model: Usuario, as: "usuario", attributes: ["id", "nome", "perfil"] },
];

async function registrarMovimentacao({
  itemId,
  tipo,
  quantidade,
  fornecedorId,
  usuarioId,
  chaveRequisicao,
}) {
  await sequelize.query(
    `CALL sp_registrar_movimentacao(
      :itemId,
      :tipo,
      :quantidade,
      :fornecedorId,
      :usuarioId,
      NULL,
      :chaveRequisicao
    )`,
    {
      replacements: {
        itemId,
        tipo,
        quantidade,
        fornecedorId: fornecedorId || null,
        usuarioId,
        chaveRequisicao,
      },
    },
  );

  return Movimentacao.findOne({
    where: { chaveRequisicao },
    include: incluir,
  });
}

module.exports = { registrarMovimentacao, incluir };
