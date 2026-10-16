const { listarAlertasEstoque } = require("../services/estoqueService");

async function alertas(_req, res, next) {
  try {
    const itens = await listarAlertasEstoque();
    return res.status(200).json({ total: itens.length, alertas: itens });
  } catch (error) {
    return next(error);
  }
}

module.exports = { alertas };
