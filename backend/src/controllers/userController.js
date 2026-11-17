const bcrypt = require("bcryptjs");
const { Usuario } = require("../models");
const campos = ["id", "nome", "email", "perfil", "ativo"];

async function listar(req, res, next) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: campos,
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
    if (!String(nome || "").trim() || !String(email || "").trim() || !senha)
      return res
        .status(400)
        .json({ error: "Nome, e-mail e senha são obrigatórios." });
    if (!["administrador", "operador"].includes(perfil))
      return res.status(400).json({ error: "Perfil inválido." });
    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await Usuario.create({
      nome: nome.trim(),
      email: email.trim(),
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

async function atualizar(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario)
      return res.status(404).json({ error: "Usuário não encontrado." });
    const { nome, email, perfil, senha } = req.body || {};
    if (!String(nome || "").trim() || !String(email || "").trim())
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
    if (!["administrador", "operador"].includes(perfil))
      return res.status(400).json({ error: "Perfil inválido." });
    if (usuario.id === req.usuario.id && perfil !== "administrador")
      return res
        .status(400)
        .json({
          error: "Não é permitido retirar o próprio perfil administrativo.",
        });
    const dados = { nome: nome.trim(), email: email.trim(), perfil };
    if (senha !== undefined && senha !== "") {
      if (typeof senha !== "string")
        return res.status(400).json({ error: "Senha inválida." });
      dados.senhaHash = await bcrypt.hash(senha, 12);
    }
    await usuario.update(dados);
    return res.json({
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

async function inativar(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario)
      return res.status(404).json({ error: "Usuário não encontrado." });
    if (usuario.id === req.usuario.id)
      return res
        .status(400)
        .json({ error: "Não é permitido inativar o próprio usuário." });
    if (!usuario.ativo)
      return res.status(409).json({ error: "Usuário já está inativo." });
    await usuario.update({ ativo: false });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, criar, atualizar, inativar };
