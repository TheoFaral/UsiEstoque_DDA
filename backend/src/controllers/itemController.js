const { Op } = require("sequelize");
const {
  Item,
  TipoPastilha,
  Fabricante,
  LocalArmazenamento,
} = require("../models");

const incluir = [
  {
    model: TipoPastilha,
    as: "tipo",
    attributes: ["id", "nome"],
  },
  {
    model: Fabricante,
    as: "fabricante",
    attributes: ["id", "nome"],
  },
  {
    model: LocalArmazenamento,
    as: "local",
    attributes: ["id", "nome"],
  },
];

async function listar(req, res, next) {
  try {
    const busca = String(req.query.busca || "").trim();
    const where = { ativo: true };

    if (busca) {
      where[Op.or] = [
        { codigo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } },
      ];
    }

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

    return res.json({
      tipos,
      fabricantes,
      locais,
    });
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

async function criar(req, res, next) {
  try {
    const data = dados(req.body || {});

    if (
      !data.codigo ||
      !data.descricao ||
      !data.tipoId ||
      !data.fabricanteId ||
      !data.localId ||
      data.estoqueMinimo < 0
    ) {
      return res.status(400).json({
        error: "Dados do item inválidos ou incompletos.",
      });
    }

    const item = await Item.create({
      ...data,
      saldoAtual: 0,
      ativo: true,
    });

    return res.status(201).json(item);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Código já cadastrado.",
      });
    }

    return next(error);
  }
}

async function atualizar(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item || !item.ativo) {
      return res.status(404).json({
        error: "Item não encontrado.",
      });
    }

    const data = dados(req.body || {});
    await item.update(data);

    return res.json(item);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Código já cadastrado.",
      });
    }

    return next(error);
  }
}

async function inativar(req, res, next) {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item || !item.ativo) {
      return res.status(404).json({
        error: "Item não encontrado.",
      });
    }

    await item.update({
      ativo: false,
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listar,
  catalogos,
  criar,
  atualizar,
  inativar,
};
