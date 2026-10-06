const { randomUUID } = require("crypto");
const { Op } = require("sequelize");
const { Movimentacao, Item, Fornecedor } = require("../models");
const {
  registrarMovimentacao,
  incluir,
} = require("../services/movimentacaoService");

function mensagemBanco(error) {
  return (
    error?.original?.sqlMessage ||
    error?.parent?.sqlMessage ||
    error?.message ||
    ""
  );
}

async function listar(req, res, next) {
  try {
    const where = {};
    const itemId = Number(req.query.itemId);
    const tipo = String(req.query.tipo || "").trim();

    if (itemId) where.itemId = itemId;
    if (["entrada", "saida"].includes(tipo)) where.tipo = tipo;

    const movimentacoes = await Movimentacao.findAll({
      where,
      include: incluir,
      order: [
        ["criadoEm", "DESC"],
        ["id", "DESC"],
      ],
      limit: 200,
    });

    return res.json(movimentacoes);
  } catch (error) {
    return next(error);
  }
}

async function catalogos(req, res, next) {
  try {
    const [itens, fornecedores] = await Promise.all([
      Item.findAll({
        where: { ativo: true },
        attributes: [
          "id",
          "codigo",
          "descricao",
          "saldoAtual",
          "estoqueMinimo",
        ],
        order: [["codigo", "ASC"]],
      }),
      Fornecedor.findAll({
        where: { ativo: true },
        attributes: ["id", "nome"],
        order: [["nome", "ASC"]],
      }),
    ]);

    return res.json({ itens, fornecedores });
  } catch (error) {
    return next(error);
  }
}

async function registrar(req, res, next) {
  try {
    const itemId = Number(req.body?.itemId);
    const tipo = String(req.body?.tipo || "").trim();
    const quantidade = Number(req.body?.quantidade);
    const fornecedorId = req.body?.fornecedorId
      ? Number(req.body.fornecedorId)
      : null;
    const chaveRequisicao = String(req.body?.chaveRequisicao || randomUUID());

    if (!itemId || !["entrada", "saida"].includes(tipo)) {
      return res
        .status(400)
        .json({ error: "Item e tipo de movimentação são obrigatórios." });
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        error: "A quantidade deve ser um número inteiro maior que zero.",
      });
    }

    if (tipo === "entrada" && !fornecedorId) {
      return res.status(400).json({ error: "A entrada exige um fornecedor." });
    }

    if (tipo === "saida" && fornecedorId) {
      return res
        .status(400)
        .json({ error: "Fornecedor não deve ser informado em saídas." });
    }

    const movimentacao = await registrarMovimentacao({
      itemId,
      tipo,
      quantidade,
      fornecedorId,
      usuarioId: req.usuario.id,
      chaveRequisicao,
    });

    return res.status(201).json(movimentacao);
  } catch (error) {
    const mensagem = mensagemBanco(error);

    if (mensagem.includes("Quantidade superior ao saldo disponivel")) {
      return res
        .status(409)
        .json({ error: "Quantidade superior ao saldo disponível." });
    }

    if (
      mensagem.includes("inexistente ou inativo") ||
      mensagem.includes("A entrada exige um fornecedor") ||
      mensagem.includes("Fornecedor somente pode ser informado") ||
      mensagem.includes("quantidade deve ser maior que zero")
    ) {
      return res.status(400).json({ error: mensagem });
    }

    return next(error);
  }
}

module.exports = { listar, catalogos, registrar };
