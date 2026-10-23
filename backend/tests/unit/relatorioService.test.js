jest.mock("../../src/models", () => ({
  Item: { findAll: jest.fn() },
  Movimentacao: { findAll: jest.fn() },
  TipoPastilha: {},
  Usuario: {},
  Fornecedor: {},
}));

const { Item, Movimentacao } = require("../../src/models");

const {
  obterResumoRelatorios,
} = require("../../src/services/relatorioService");

describe("relatorioService", () => {
  beforeEach(() => jest.clearAllMocks());

  test("consolida saldo, consumo, movimentacoes detalhadas e itens para reposicao", async () => {
    Item.findAll.mockResolvedValue([
      {
        id: 1,
        codigo: "PT-01",
        descricao: "Item A",
        saldoAtual: 8,
        estoqueMinimo: 5,
      },
      {
        id: 2,
        codigo: "PT-02",
        descricao: "Item B",
        saldoAtual: 5,
        estoqueMinimo: 5,
      },
      {
        id: 3,
        codigo: "PT-03",
        descricao: "Item C",
        saldoAtual: 0,
        estoqueMinimo: 5,
      },
    ]);

    Movimentacao.findAll.mockResolvedValue([
      {
        id: 1,
        itemId: 1,
        tipo: "entrada",
        quantidade: 10,
        saldoAnterior: 0,
        saldoPosterior: 10,
        criadoEm: "2026-10-01T10:00:00.000Z",
        item: {
          id: 1,
          codigo: "PT-01",
          descricao: "Item A",
          tipo: { id: 5, nome: "Torneamento" },
        },
        usuario: {
          id: 1,
          nome: "Administrador Local",
          perfil: "administrador",
        },
        fornecedor: { id: 1, nome: "Fornecedor A" },
      },
      {
        id: 2,
        itemId: 1,
        tipo: "saida",
        quantidade: 2,
        saldoAnterior: 10,
        saldoPosterior: 8,
        criadoEm: "2026-10-02T10:00:00.000Z",
        item: {
          id: 1,
          codigo: "PT-01",
          descricao: "Item A",
          tipo: { id: 5, nome: "Torneamento" },
        },
        usuario: {
          id: 1,
          nome: "Administrador Local",
          perfil: "administrador",
        },
        fornecedor: null,
      },
      {
        id: 3,
        itemId: 2,
        tipo: "ajuste_saida",
        quantidade: 3,
        saldoAnterior: 8,
        saldoPosterior: 5,
        criadoEm: "2026-10-03T10:00:00.000Z",
        justificativa: "Ajuste de inventário",
        item: {
          id: 2,
          codigo: "PT-02",
          descricao: "Item B",
          tipo: { id: 6, nome: "Fresamento" },
        },
        usuario: {
          id: 1,
          nome: "Administrador Local",
          perfil: "administrador",
        },
        fornecedor: null,
      },
    ]);

    const resultado = await obterResumoRelatorios();

    expect(resultado.indicadores).toEqual({
      totalItensAtivos: 3,
      saldoTotal: 13,
      itensParaReposicao: 2,
      semEstoque: 1,
      totalMovimentacoes: 3,
      totalEntradas: 10,
      totalSaidas: 5,
    });

    expect(resultado.consumoPorItem).toEqual([
      expect.objectContaining({
        codigo: "PT-02",
        quantidadeSaida: 3,
        tipoPastilha: { id: 6, nome: "Fresamento" },
      }),
      expect.objectContaining({
        codigo: "PT-01",
        quantidadeSaida: 2,
        tipoPastilha: { id: 5, nome: "Torneamento" },
      }),
    ]);

    expect(resultado.movimentacoesDetalhadas).toHaveLength(3);
    expect(resultado.movimentacoesDetalhadas[0]).toEqual(
      expect.objectContaining({
        id: 1,
        tipo: "entrada",
        quantidade: 10,
        saldoAnterior: 0,
        saldoPosterior: 10,
        item: expect.objectContaining({
          codigo: "PT-01",
          tipo: { id: 5, nome: "Torneamento" },
        }),
        usuario: expect.objectContaining({
          nome: "Administrador Local",
        }),
      }),
    );

    expect(resultado.itensParaReposicao.map((item) => item.codigo)).toEqual([
      "PT-02",
      "PT-03",
    ]);
  });

  test("aplica filtros por item e tipo de pastilha na consulta de movimentacoes", async () => {
    Item.findAll.mockResolvedValue([]);
    Movimentacao.findAll.mockResolvedValue([]);

    const resultado = await obterResumoRelatorios({
      dataInicio: "2026-10-01",
      dataFim: "2026-10-31",
      itemId: "2",
      tipoPastilhaId: "5",
    });

    expect(resultado.filtros).toEqual({
      dataInicio: "2026-10-01",
      dataFim: "2026-10-31",
      itemId: 2,
      tipoPastilhaId: 5,
    });

    expect(Movimentacao.findAll).toHaveBeenCalledTimes(1);

    const consulta = Movimentacao.findAll.mock.calls[0][0];

    expect(consulta.where.itemId).toBe(2);
    expect(consulta.where.criadoEm).toBeDefined();

    const includeItem = consulta.include.find(
      (include) => include.as === "item",
    );

    expect(includeItem).toEqual(
      expect.objectContaining({
        required: true,
        where: { tipoId: 5 },
      }),
    );

    expect(resultado.movimentacoesDetalhadas).toEqual([]);
    expect(resultado.consumoPorItem).toEqual([]);
  });

  test("rejeita itemId invalido antes de consultar o banco", async () => {
    await expect(
      obterResumoRelatorios({
        itemId: "abc",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "itemId deve ser um número inteiro positivo.",
    });

    expect(Item.findAll).not.toHaveBeenCalled();
    expect(Movimentacao.findAll).not.toHaveBeenCalled();
  });

  test("rejeita tipoPastilhaId invalido antes de consultar o banco", async () => {
    await expect(
      obterResumoRelatorios({
        tipoPastilhaId: "0",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "tipoPastilhaId deve ser um número inteiro positivo.",
    });

    expect(Item.findAll).not.toHaveBeenCalled();
    expect(Movimentacao.findAll).not.toHaveBeenCalled();
  });

  test("rejeita periodo invertido antes de consultar o banco", async () => {
    await expect(
      obterResumoRelatorios({
        dataInicio: "2026-10-31",
        dataFim: "2026-10-01",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "A data final deve ser igual ou posterior à data inicial.",
    });

    expect(Item.findAll).not.toHaveBeenCalled();
    expect(Movimentacao.findAll).not.toHaveBeenCalled();
  });
});
