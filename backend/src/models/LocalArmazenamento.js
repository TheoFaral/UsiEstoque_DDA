const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LocalArmazenamento = sequelize.define(
  "LocalArmazenamento",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    descricao: { type: DataTypes.STRING(255), allowNull: true },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: "locais_armazenamento", timestamps: false },
);

module.exports = LocalArmazenamento;
