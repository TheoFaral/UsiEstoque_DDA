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

  test("lista somente itens sem estoque ou no minimo", async () => {
    Item.findAll.mockResolvedValue([
      { id: 1, codigo: "A", saldoAtual: 0, estoqueMinimo: 5, ativo: true },
      { id: 2, codigo: "B", saldoAtual: 5, estoqueMinimo: 5, ativo: true },
      { id: 3, codigo: "C", saldoAtual: 8, estoqueMinimo: 5, ativo: true },
    ]);
    const alertas = await listarAlertasEstoque();
    expect(alertas.map((item) => item.codigo)).toEqual(["A", "B"]);
    expect(alertas[0].situacaoEstoque).toBe("sem_estoque");
    expect(alertas[1].situacaoEstoque).toBe("critico");
  });

  test("calcula indicadores basicos do estoque", async () => {
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

  test("devolve indicadores zerados quando nao ha itens ativos", async () => {
    Item.findAll.mockResolvedValue([]);
    expect(await obterIndicadoresEstoque()).toEqual({
      totalItensAtivos: 0,
      semEstoque: 0,
      criticos: 0,
      normais: 0,
      saldoTotal: 0,
    });
    expect(await listarAlertasEstoque()).toEqual([]);
    expect(Item.findAll).toHaveBeenCalledWith({
      where: { ativo: true },
      order: [["codigo", "ASC"]],
    });
  });

  test("limite exato e estoque minimo zero", async () => {
    Item.findAll.mockResolvedValue([
      { id: 1, codigo: "X", saldoAtual: 2, estoqueMinimo: 2 },
      { id: 2, codigo: "Y", saldoAtual: 1, estoqueMinimo: 0 },
      { id: 3, codigo: "Z", saldoAtual: 0, estoqueMinimo: 0 },
    ]);
    const alertas = await listarAlertasEstoque();
    expect(alertas.map((item) => item.codigo)).toEqual(["X", "Z"]);
    expect(alertas.map((item) => item.situacaoEstoque)).toEqual([
      "critico",
      "sem_estoque",
    ]);
  });

  test("normaliza numeros recebidos como texto e instancias ORM", async () => {
    Item.findAll.mockResolvedValue([
      {
        toJSON: () => ({
          id: 1,
          codigo: "A",
          saldoAtual: "3",
          estoqueMinimo: "5",
        }),
      },
      {
        toJSON: () => ({
          id: 2,
          codigo: "B",
          saldoAtual: "10",
          estoqueMinimo: "5",
        }),
      },
    ]);
    const indicadores = await obterIndicadoresEstoque();
    expect(indicadores.saldoTotal).toBe(13);
    expect(indicadores.criticos).toBe(1);
    expect(indicadores.normais).toBe(1);
  });

  test("propaga falha de consulta para tratamento na API", async () => {
    Item.findAll.mockRejectedValue(new Error("Falha simulada do banco"));
    await expect(listarAlertasEstoque()).rejects.toThrow(
      "Falha simulada do banco",
    );
    await expect(obterIndicadoresEstoque()).rejects.toThrow(
      "Falha simulada do banco",
    );
  });
});
