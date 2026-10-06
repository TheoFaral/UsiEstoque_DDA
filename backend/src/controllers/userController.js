const bcrypt = require("bcryptjs");
const { Usuario } = require("../models");

async function listar(req, res, next) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ["id", "nome", "email", "perfil", "ativo"],
      order: [["nome", "ASC"]],
    });
    return res.json(usuarios);
  } catch (error) {
    return next(error);
  }
}

async function criar(req, res, next) {
  try {
    const { nome, email, senha, perfil = "operador" } = req.body || {};
    if (!nome || !email || !senha)
      return res
        .status(400)
        .json({ error: "Nome, e-mail e senha são obrigatórios." });
    if (!["administrador", "operador"].includes(perfil))
      return res.status(400).json({ error: "Perfil inválido." });
    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await Usuario.create({
      nome,
      email,
      senhaHash,
      perfil,
      ativo: true,
    });
    return res
      .status(201)
      .json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({ error: "E-mail já cadastrado." });
    return next(error);
  }
}

module.exports = { listar, criar };
