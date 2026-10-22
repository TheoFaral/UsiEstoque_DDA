jest.mock("../../src/models", () => ({
  Item: { findAll: jest.fn() },
  Movimentacao: { findAll: jest.fn() },
}));

const { Item, Movimentacao } = require("../../src/models");
const {
  obterResumoRelatorios,
} = require("../../src/services/relatorioService");

describe("relatorioService", () => {
  beforeEach(() => jest.clearAllMocks());

  test("consolida saldo, consumo, movimentacoes e itens para reposicao", async () => {
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
        item: { codigo: "PT-01", descricao: "Item A" },
      },
      {
        id: 2,
        itemId: 1,
        tipo: "saida",
        quantidade: 2,
        item: { codigo: "PT-01", descricao: "Item A" },
      },
      {
        id: 3,
        itemId: 2,
        tipo: "saida",
        quantidade: 3,
        item: { codigo: "PT-02", descricao: "Item B" },
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
      expect.objectContaining({ codigo: "PT-02", quantidadeSaida: 3 }),
      expect.objectContaining({ codigo: "PT-01", quantidadeSaida: 2 }),
    ]);
    expect(resultado.itensParaReposicao.map((item) => item.codigo)).toEqual([
      "PT-02",
      "PT-03",
    ]);
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
