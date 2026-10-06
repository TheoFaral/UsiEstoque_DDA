const Usuario = require("./Usuario");
const TipoPastilha = require("./TipoPastilha");
const Fabricante = require("./Fabricante");
const LocalArmazenamento = require("./LocalArmazenamento");
const Item = require("./Item");

TipoPastilha.hasMany(Item, { foreignKey: "tipoId", as: "itens" });
Item.belongsTo(TipoPastilha, { foreignKey: "tipoId", as: "tipo" });
Fabricante.hasMany(Item, { foreignKey: "fabricanteId", as: "itens" });
Item.belongsTo(Fabricante, { foreignKey: "fabricanteId", as: "fabricante" });
LocalArmazenamento.hasMany(Item, { foreignKey: "localId", as: "itens" });
Item.belongsTo(LocalArmazenamento, { foreignKey: "localId", as: "local" });

module.exports = {
  Usuario,
  TipoPastilha,
  Fabricante,
  LocalArmazenamento,
  Item,
};
