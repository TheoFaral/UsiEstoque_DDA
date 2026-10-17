jest.mock("../../src/models", () => ({
  Item: { findAll: jest.fn() },
}));

const { Item } = require("../../src/models");
const {
  listarAlertasEstoque,
  obterIndicadoresEstoque,
} = require("../../src/services/estoqueService");

describe("estoqueService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("lista somente itens no mínimo ou abaixo dele", async () => {
    Item.findAll.mockResolvedValue([
      { id: 1, codigo: "A", saldoAtual: 0, estoqueMinimo: 5, ativo: true },
      { id: 2, codigo: "B", saldoAtual: 5, estoqueMinimo: 5, ativo: true },
      { id: 3, codigo: "C", saldoAtual: 8, estoqueMinimo: 5, ativo: true },
    ]);

    const alertas = await listarAlertasEstoque();

    expect(alertas).toHaveLength(2);
    expect(alertas.map((item) => item.codigo)).toEqual(["A", "B"]);
    expect(alertas[0].situacaoEstoque).toBe("sem_estoque");
    expect(alertas[1].situacaoEstoque).toBe("critico");
  });

  test("calcula os indicadores básicos do estoque", async () => {
    Item.findAll.mockResolvedValue([
      { id: 1, codigo: "A", saldoAtual: 0, estoqueMinimo: 5, ativo: true },
      { id: 2, codigo: "B", saldoAtual: 4, estoqueMinimo: 5, ativo: true },
      { id: 3, codigo: "C", saldoAtual: 8, estoqueMinimo: 5, ativo: true },
    ]);

    const indicadores = await obterIndicadoresEstoque();

    expect(indicadores).toEqual({
      totalItensAtivos: 3,
      semEstoque: 1,
      criticos: 1,
      normais: 1,
      saldoTotal: 12,
    });
  });
});
