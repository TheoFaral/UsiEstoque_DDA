const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Fabricante = sequelize.define(
  "Fabricante",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    contato: { type: DataTypes.STRING(150), allowNull: true },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: "fabricantes", timestamps: false },
);

module.exports = Fabricante;
