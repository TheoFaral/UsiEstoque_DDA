const Usuario = require("./Usuario");
const TipoPastilha = require("./TipoPastilha");
const Fabricante = require("./Fabricante");
const Fornecedor = require("./Fornecedor");
const LocalArmazenamento = require("./LocalArmazenamento");
const Item = require("./Item");
const Movimentacao = require("./Movimentacao");

TipoPastilha.hasMany(Item, { foreignKey: "tipoId", as: "itens" });
Item.belongsTo(TipoPastilha, { foreignKey: "tipoId", as: "tipo" });

Fabricante.hasMany(Item, { foreignKey: "fabricanteId", as: "itens" });
Item.belongsTo(Fabricante, { foreignKey: "fabricanteId", as: "fabricante" });

LocalArmazenamento.hasMany(Item, { foreignKey: "localId", as: "itens" });
Item.belongsTo(LocalArmazenamento, { foreignKey: "localId", as: "local" });

Item.hasMany(Movimentacao, { foreignKey: "itemId", as: "movimentacoes" });
Movimentacao.belongsTo(Item, { foreignKey: "itemId", as: "item" });

Fornecedor.hasMany(Movimentacao, {
  foreignKey: "fornecedorId",
  as: "movimentacoes",
});
Movimentacao.belongsTo(Fornecedor, {
  foreignKey: "fornecedorId",
  as: "fornecedor",
});

Usuario.hasMany(Movimentacao, { foreignKey: "usuarioId", as: "movimentacoes" });
Movimentacao.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

module.exports = {
  Usuario,
  TipoPastilha,
  Fabricante,
  Fornecedor,
  LocalArmazenamento,
  Item,
  Movimentacao,
};
