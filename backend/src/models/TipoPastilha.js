const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TipoPastilha = sequelize.define(
  "TipoPastilha",
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
  { tableName: "tipos_pastilha", timestamps: false },
);

module.exports = TipoPastilha;
