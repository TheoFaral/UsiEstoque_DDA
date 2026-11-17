const {
  TipoPastilha,
  Fabricante,
  Fornecedor,
  LocalArmazenamento,
} = require("../models");
const modelos = {
  tipos: { model: TipoPastilha, campos: ["nome", "descricao"] },
  fabricantes: { model: Fabricante, campos: ["nome", "contato"] },
  fornecedores: { model: Fornecedor, campos: ["nome", "contato"] },
  locais: { model: LocalArmazenamento, campos: ["nome", "descricao"] },
};
function configuracao(req) {
  return modelos[req.params.categoria];
}
function payload(body, campos) {
  const dados = {};
  for (const campo of campos) {
    const valor = body?.[campo];
    dados[campo] = typeof valor === "string" ? valor.trim() || null : null;
  }
  return dados;
}
function falha(res, error, next) {
  if (error.name === "SequelizeUniqueConstraintError")
    return res.status(409).json({ error: "Nome já cadastrado." });
  return next(error);
}
async function listar(req, res, next) {
  try {
    const cfg = configuracao(req);
    if (!cfg) return res.status(404).json({ error: "Cadastro inexistente." });
    return res.json(await cfg.model.findAll({ order: [["nome", "ASC"]] }));
  } catch (error) {
    return next(error);
  }
}
async function criar(req, res, next) {
  try {
    const cfg = configuracao(req);
    if (!cfg) return res.status(404).json({ error: "Cadastro inexistente." });
    const dados = payload(req.body, cfg.campos);
    if (!dados.nome)
      return res.status(400).json({ error: "Nome é obrigatório." });
    return res
      .status(201)
      .json(await cfg.model.create({ ...dados, ativo: true }));
  } catch (error) {
    return falha(res, error, next);
  }
}
async function atualizar(req, res, next) {
  try {
    const cfg = configuracao(req);
    if (!cfg) return res.status(404).json({ error: "Cadastro inexistente." });
    const registro = await cfg.model.findByPk(req.params.id);
    if (!registro)
      return res.status(404).json({ error: "Registro não encontrado." });
    if (!registro.ativo)
      return res
        .status(409)
        .json({ error: "Registro inativo não pode ser editado." });
    const dados = payload(req.body, cfg.campos);
    if (!dados.nome)
      return res.status(400).json({ error: "Nome é obrigatório." });
    await registro.update(dados);
    return res.json(registro);
  } catch (error) {
    return falha(res, error, next);
  }
}
async function inativar(req, res, next) {
  try {
    const cfg = configuracao(req);
    if (!cfg) return res.status(404).json({ error: "Cadastro inexistente." });
    const registro = await cfg.model.findByPk(req.params.id);
    if (!registro)
      return res.status(404).json({ error: "Registro não encontrado." });
    if (!registro.ativo)
      return res.status(409).json({ error: "Registro já inativo." });
    await registro.update({ ativo: false });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
module.exports = { listar, criar, atualizar, inativar };
