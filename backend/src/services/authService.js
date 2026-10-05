const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { Usuario } = require("../models");

async function autenticar(email, senha) {
  if (!env.jwtSecret) throw new Error("JWT_SECRET não configurado.");
  const usuario = await Usuario.findOne({ where: { email, ativo: true } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash)))
    return null;
  const token = jwt.sign(
    { sub: usuario.id, perfil: usuario.perfil },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
  };
}

module.exports = { autenticar };
