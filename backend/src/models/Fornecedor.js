const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Fornecedor = sequelize.define(
  "Fornecedor",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    contato: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "fornecedores",
    timestamps: false,
  },
);

module.exports = Fornecedor;
