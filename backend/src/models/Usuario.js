const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    senhaHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "senha_hash",
    },
    perfil: {
      type: DataTypes.ENUM("administrador", "operador"),
      allowNull: false,
      defaultValue: "operador",
    },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    criadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "criado_em",
      defaultValue: DataTypes.NOW,
    },
    atualizadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "atualizado_em",
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: "usuarios", timestamps: false },
);

module.exports = Usuario;
