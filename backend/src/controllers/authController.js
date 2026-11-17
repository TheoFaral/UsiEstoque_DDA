const { autenticar } = require("../services/authService");

async function login(req, res, next) {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha)
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    const resultado = await autenticar(email, senha);
    if (!resultado)
      return res.status(401).json({ error: "Credenciais inválidas." });
    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}

module.exports = { login };
