const {
  listarAlertasEstoque,
  obterIndicadoresEstoque,
} = require("../services/estoqueService");

async function alertas(_req, res, next) {
  try {
    const itens = await listarAlertasEstoque();
    return res.status(200).json({ total: itens.length, alertas: itens });
  } catch (error) {
    return next(error);
  }
}

async function indicadores(_req, res, next) {
  try {
    const dados = await obterIndicadoresEstoque();
    return res.status(200).json(dados);
  } catch (error) {
    return next(error);
  }
}

module.exports = { alertas, indicadores };
