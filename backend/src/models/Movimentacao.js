const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Movimentacao = sequelize.define(
  "Movimentacao",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    itemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "item_id",
    },
    tipo: {
      type: DataTypes.ENUM(
        "entrada",
        "saida",
        "ajuste_entrada",
        "ajuste_saida",
      ),
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    saldoAnterior: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "saldo_anterior",
    },
    saldoPosterior: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "saldo_posterior",
    },
    fornecedorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "fornecedor_id",
    },
    usuarioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "usuario_id",
    },
    justificativa: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    chaveRequisicao: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
      field: "chave_requisicao",
    },
    criadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "criado_em",
    },
  },
  {
    tableName: "movimentacoes",
    timestamps: false,
  },
);

module.exports = Movimentacao;
