const { Op, where: sqlWhere, col } = require("sequelize");
const {
  Item,
  TipoPastilha,
  Fabricante,
  LocalArmazenamento,
} = require("../models");

const incluir = [
  { model: TipoPastilha, as: "tipo", attributes: ["id", "nome"] },
  { model: Fabricante, as: "fabricante", attributes: ["id", "nome"] },
  { model: LocalArmazenamento, as: "local", attributes: ["id", "nome"] },
];

function idFiltro(valor) {
  if (valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : NaN;
}

async function listar(req, res, next) {
  try {
    const busca = String(req.query.busca || "").trim();
    const tipoId = idFiltro(req.query.tipoId);
    const fabricanteId = idFiltro(req.query.fabricanteId);
    const localId = idFiltro(req.query.localId);
    const situacao = String(req.query.situacao || "")
      .trim()
      .toLowerCase();
    if (
      [tipoId, fabricanteId, localId].some(Number.isNaN) ||
      (situacao && !["normal", "critico"].includes(situacao))
    ) {
      return res.status(400).json({ error: "Filtros inválidos." });
    }
    const where = { ativo: true };
    if (busca) {
      where[Op.or] = [
        { codigo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } },
      ];
    }
    if (tipoId !== null) where.tipoId = tipoId;
    if (fabricanteId !== null) where.fabricanteId = fabricanteId;
    if (localId !== null) where.localId = localId;
    if (situacao === "critico")
      where[Op.and] = sqlWhere(
        col("Item.saldo_atual"),
        Op.lte,
        col("Item.estoque_minimo"),
      );
    if (situacao === "normal")
      where[Op.and] = sqlWhere(
        col("Item.saldo_atual"),
        Op.gt,
        col("Item.estoque_minimo"),
      );
    const itens = await Item.findAll({
      where,
      include: incluir,
      order: [["codigo", "ASC"]],
    });
    return res.json(itens);
  } catch (error) {
    return next(error);
  }
}

async function catalogos(req, res, next) {
  try {
    const [tipos, fabricantes, locais] = await Promise.all([
      TipoPastilha.findAll({
        where: { ativo: true },
        attributes: ["id", "nome"],
        order: [["nome", "ASC"]],
      }),
      Fabricante.findAll({
        where: { ativo: true },
        attributes: ["id", "nome"],
        order: [["nome", "ASC"]],
      }),
      LocalArmazenamento.findAll({
        where: { ativo: true },
        attributes: ["id", "nome"],
        order: [["nome", "ASC"]],
      }),
    ]);
    return res.json({ tipos, fabricantes, locais });
  } catch (error) {
    return next(error);
  }
}

function dados(body) {
  return {
    codigo: String(body.codigo || "").trim(),
    descricao: String(body.descricao || "").trim(),
    tipoId: Number(body.tipoId),
    fabricanteId: Number(body.fabricanteId),
    localId: Number(body.localId),
    estoqueMinimo: Number(body.estoqueMinimo ?? 0),
  };
}

function valido(data) {
  return Boolean(
    data.codigo &&
    data.descricao &&
    [data.tipoId, data.fabricanteId, data.localId].every(
      (n) => Number.isSafeInteger(n) && n > 0,
    ) &&
    Number.isSafeInteger(data.estoqueMinimo) &&
    data.estoqueMinimo >= 0,
  );
}

async function cadastrosAtivos(data) {
  const [tipo, fabricante, local] = await Promise.all([
    TipoPastilha.findOne({ where: { id: data.tipoId, ativo: true } }),
    Fabricante.findOne({ where: { id: data.fabricanteId, ativo: true } }),
    LocalArmazenamento.findOne({ where: { id: data.localId, ativo: true } }),
  ]);
  return Boolean(tipo && fabricante && local);
}

function erroUnico(res, error, next) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ error: "Código já cadastrado." });
  }
  return next(error);
}

async function criar(req, res, next) {
  try {
    const data = dados(req.body || {});
    if (!valido(data))
      return res
        .status(400)
        .json({ error: "Dados do item inválidos ou incompletos." });
    if (!(await cadastrosAtivos(data))) {
      return res.status(400).json({
        error: "Tipo, fabricante e local devem existir e estar ativos.",
      });
    }
    const item = await Item.create({ ...data, saldoAtual: 0, ativo: true });
    return res.status(201).json(item);
  } catch (error) {
    return erroUnico(res, error, next);
  }
}

async function atualizar(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item || !item.ativo)
      return res.status(404).json({ error: "Item não encontrado." });
    const data = dados(req.body || {});
    if (!valido(data))
      return res
        .status(400)
        .json({ error: "Dados do item inválidos ou incompletos." });
    if (!(await cadastrosAtivos(data))) {
      return res.status(400).json({
        error: "Tipo, fabricante e local devem existir e estar ativos.",
      });
    }
    await item.update(data);
    return res.json(item);
  } catch (error) {
    return erroUnico(res, error, next);
  }
}

async function inativar(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item || !item.ativo)
      return res.status(404).json({ error: "Item não encontrado." });
    await item.update({ ativo: false });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, catalogos, criar, atualizar, inativar };
