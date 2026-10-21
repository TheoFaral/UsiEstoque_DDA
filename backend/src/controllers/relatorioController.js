const { obterResumoRelatorios } = require("../services/relatorioService");

async function resumo(req, res, next) {
  try {
    const resultado = await obterResumoRelatorios({
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
    });

    return res.json(resultado);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

module.exports = { resumo };
