jest.mock("../../src/models", () => ({
  Item: {},
  Fornecedor: {},
}));

jest.mock("../../src/services/movimentacaoService", () => ({
  registrarMovimentacao: jest.fn(),
  listarMovimentacoes: jest.fn(),
}));

const { registrar } = require("../../src/controllers/movimentacaoController");
const {
  registrarMovimentacao,
} = require("../../src/services/movimentacaoService");

const chave = "11111111-1111-4111-8111-111111111111";

function criarContexto(campos = {}) {
  const req = {
    body: {
      itemId: 1,
      tipo: "saida",
      quantidade: 3,
      fornecedorId: null,
      justificativa: "",
      chaveRequisicao: chave,
      ...campos,
    },
    usuario: { id: 7, perfil: "operador" },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const next = jest.fn();

  return { req, res, next };
}

describe("movimentacaoController.registrar: saida", () => {
  beforeEach(() => jest.resetAllMocks());

  test("TU-SAI-01: aceita saida valida", async () => {
    const { req, res, next } = criarContexto();
    const movimentacao = { id: 21, tipo: "saida", quantidade: 3 };

    registrarMovimentacao.mockResolvedValue(movimentacao);

    await registrar(req, res, next);

    expect(registrarMovimentacao).toHaveBeenCalledTimes(1);
    expect(registrarMovimentacao).toHaveBeenCalledWith({
      itemId: 1,
      tipo: "saida",
      quantidade: 3,
      fornecedorId: null,
      usuarioId: 7,
      justificativa: null,
      chaveRequisicao: chave,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(movimentacao);
    expect(next).not.toHaveBeenCalled();
  });

  test("TU-SAI-02: recusa quantidades invalidas", async () => {
    for (const quantidade of [0, -1, 1.5, "abc", null]) {
      const { req, res, next } = criarContexto({ quantidade });

      await registrar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "A quantidade deve ser um número inteiro maior que zero.",
      });
      expect(next).not.toHaveBeenCalled();
    }

    expect(registrarMovimentacao).not.toHaveBeenCalled();
  });

  test("TU-SAI-03: recusa item ou tipo invalido", async () => {
    const entradas = [
      { itemId: 0 },
      { itemId: "abc" },
      { tipo: "transferencia" },
    ];

    for (const campos of entradas) {
      const { req, res, next } = criarContexto(campos);

      await registrar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Item e tipo de movimentação válidos são obrigatórios.",
      });
      expect(next).not.toHaveBeenCalled();
    }

    expect(registrarMovimentacao).not.toHaveBeenCalled();
  });

  test("TU-SAI-04: recusa fornecedor na saida", async () => {
    const { req, res, next } = criarContexto({ fornecedorId: 9 });

    await registrar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Fornecedor somente deve ser informado em entradas.",
    });
    expect(registrarMovimentacao).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("TU-SAI-05: retorna 409 para saldo insuficiente", async () => {
    const { req, res, next } = criarContexto();

    registrarMovimentacao.mockRejectedValue(
      new Error("Quantidade superior ao saldo disponivel"),
    );

    await registrar(req, res, next);

    expect(registrarMovimentacao).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Quantidade superior ao saldo disponível.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("TU-SAI-06: retorna 400 para item inexistente ou inativo", async () => {
    const { req, res, next } = criarContexto();
    const erro = new Error("Item inexistente ou inativo.");

    registrarMovimentacao.mockRejectedValue(erro);

    await registrar(req, res, next);

    expect(registrarMovimentacao).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Item inexistente ou inativo.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("TU-SAI-07: encaminha erro inesperado ao next", async () => {
    const { req, res, next } = criarContexto();
    const erro = new Error("Falha inesperada simulada");

    registrarMovimentacao.mockRejectedValue(erro);

    await registrar(req, res, next);

    expect(registrarMovimentacao).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(erro);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
