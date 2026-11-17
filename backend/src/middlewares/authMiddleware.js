const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { Usuario } = require("../models");

async function autenticarToken(req, res, next) {
  try {
    const [tipo, token] = (req.headers.authorization || "").split(" ");
    if (tipo !== "Bearer" || !token)
      return res.status(401).json({ error: "Token não informado." });
    const payload = jwt.verify(token, env.jwtSecret);
    const usuario = await Usuario.findOne({
      where: { id: payload.sub, ativo: true },
    });
    if (!usuario)
      return res.status(401).json({ error: "Usuário inválido ou inativo." });
    req.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    };
    return next();
  } catch (_) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

function exigirPerfil(...perfis) {
  return (req, res, next) =>
    perfis.includes(req.usuario?.perfil)
      ? next()
      : res
          .status(403)
          .json({ error: "Acesso não autorizado para este perfil." });
}

module.exports = { autenticarToken, exigirPerfil };
