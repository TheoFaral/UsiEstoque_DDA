const { randomUUID } = require("crypto");
const { Item, Fornecedor } = require("../models");
const {
  registrarMovimentacao,
  listarMovimentacoes,
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
    const movimentacoes = await listarMovimentacoes(req.query);
    return res.json(movimentacoes);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function catalogos(_req, res, next) {
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
    const justificativa = String(req.body?.justificativa || "").trim();
    const chaveRequisicao = String(req.body?.chaveRequisicao || randomUUID());

    const tipos = ["entrada", "saida", "ajuste_entrada", "ajuste_saida"];

    const ajuste = tipo.startsWith("ajuste_");

    if (!Number.isInteger(itemId) || itemId <= 0 || !tipos.includes(tipo)) {
      return res.status(400).json({
        error: "Item e tipo de movimentação válidos são obrigatórios.",
      });
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        error: "A quantidade deve ser um número inteiro maior que zero.",
      });
    }

    if (ajuste && req.usuario?.perfil !== "administrador") {
      return res.status(403).json({
        error: "Apenas o Administrador pode registrar ajustes.",
      });
    }

    if (ajuste && !justificativa) {
      return res.status(400).json({
        error: "A justificativa é obrigatória para ajustes.",
      });
    }

    if (justificativa.length > 500) {
      return res.status(400).json({
        error: "A justificativa deve ter no máximo 500 caracteres.",
      });
    }

    if (
      tipo === "entrada" &&
      (!Number.isInteger(fornecedorId) || fornecedorId <= 0)
    ) {
      return res.status(400).json({
        error: "A entrada exige um fornecedor.",
      });
    }

    if (tipo !== "entrada" && fornecedorId) {
      return res.status(400).json({
        error: "Fornecedor somente deve ser informado em entradas.",
      });
    }

    const movimentacao = await registrarMovimentacao({
      itemId,
      tipo,
      quantidade,
      fornecedorId: tipo === "entrada" ? fornecedorId : null,
      usuarioId: req.usuario.id,
      justificativa: ajuste ? justificativa : null,
      chaveRequisicao,
    });

    return res.status(201).json(movimentacao);
  } catch (error) {
    const mensagem = mensagemBanco(error);

    if (mensagem.includes("Quantidade superior ao saldo disponivel")) {
      return res.status(409).json({
        error: "Quantidade superior ao saldo disponível.",
      });
    }

    if (
      mensagem.includes("inexistente ou inativo") ||
      mensagem.includes("exige um fornecedor") ||
      mensagem.includes("Fornecedor somente") ||
      mensagem.includes("quantidade deve ser maior que zero") ||
      mensagem.toLowerCase().includes("justificativa") ||
      mensagem.toLowerCase().includes("administrador")
    ) {
      return res.status(400).json({ error: mensagem });
    }

    return next(error);
  }
}

module.exports = { listar, catalogos, registrar };
