const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  descricao: { type: DataTypes.STRING(255), allowNull: false },
  tipoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'tipo_id' },
  fabricanteId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'fabricante_id' },
  localId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'local_id' },
  estoqueMinimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'estoque_minimo' },
  saldoAtual: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'saldo_atual' },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'itens', timestamps: false })

module.exports = Item
