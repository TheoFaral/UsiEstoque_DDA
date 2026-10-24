jest.mock("../../src/config/database", () => ({ query: jest.fn() }));
jest.mock("../../src/models", () => ({
  Movimentacao: { findOne: jest.fn(), findAll: jest.fn() },
  Item: {},
  Fornecedor: {},
  Usuario: {},
}));
const { Op } = require("sequelize");
const sequelize = require("../../src/config/database");
const { Movimentacao } = require("../../src/models");
const {
  construirFiltroHistorico,
  listarMovimentacoes,
  registrarMovimentacao,
} = require("../../src/services/movimentacaoService");

describe("movimentacaoService", () => {
  beforeEach(() => jest.clearAllMocks());
  test("usa a procedure oficial e consulta pela chave da requisição", async () => {
    const movimento = {
      id: 10,
      chaveRequisicao: "11111111-1111-4111-8111-111111111111",
    };
    sequelize.query.mockResolvedValue([]);
    Movimentacao.findOne.mockResolvedValue(movimento);
    const resultado = await registrarMovimentacao({
      itemId: 1,
      tipo: "entrada",
      quantidade: 10,
      fornecedorId: 1,
      usuarioId: 1,
      justificativa: null,
      chaveRequisicao: movimento.chaveRequisicao,
    });
    expect(sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining("CALL sp_registrar_movimentacao"),
      expect.objectContaining({
        replacements: expect.objectContaining({
          itemId: 1,
          tipo: "entrada",
          quantidade: 10,
          fornecedorId: 1,
          usuarioId: 1,
          justificativa: null,
        }),
      }),
    );
    expect(resultado).toEqual(movimento);
  });
  test("encaminha ajuste e justificativa para a procedure", async () => {
    sequelize.query.mockResolvedValue([]);
    Movimentacao.findOne.mockResolvedValue({ id: 20 });
    await registrarMovimentacao({
      itemId: 2,
      tipo: "ajuste_saida",
      quantidade: 1,
      fornecedorId: null,
      usuarioId: 1,
      justificativa: "Contagem física",
      chaveRequisicao: "abc-123",
    });
    expect(sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining("sp_registrar_movimentacao"),
      expect.objectContaining({
        replacements: expect.objectContaining({
          tipo: "ajuste_saida",
          justificativa: "Contagem física",
          fornecedorId: null,
        }),
      }),
    );
  });
  test("monta filtros por item, tipo e período", () => {
    const where = construirFiltroHistorico({
      itemId: "4",
      tipo: "saida",
      dataInicio: "2026-10-01",
      dataFim: "2026-10-31",
    });
    expect(where.itemId).toBe(4);
    expect(where.tipo).toBe("saida");
    expect(where.criadoEm[Op.gte]).toEqual(new Date("2026-10-01T00:00:00"));
    expect(where.criadoEm[Op.lte]).toEqual(new Date("2026-10-31T23:59:59.999"));
  });
  test("filtra ajustes no histórico", () => {
    expect(construirFiltroHistorico({ tipo: "ajuste_entrada" }).tipo).toBe(
      "ajuste_entrada",
    );
  });
  test("recusa período invertido", () => {
    expect(() =>
      construirFiltroHistorico({
        dataInicio: "2026-10-31",
        dataFim: "2026-10-01",
      }),
    ).toThrow("A data final deve ser igual ou posterior à data inicial.");
  });
  test("lista movimentações com os filtros construídos", async () => {
    Movimentacao.findAll.mockResolvedValue([{ id: 1, tipo: "saida" }]);
    const resultado = await listarMovimentacoes({ tipo: "saida" });
    expect(Movimentacao.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tipo: "saida" },
        order: [
          ["criadoEm", "DESC"],
          ["id", "DESC"],
        ],
        limit: 200,
      }),
    );
    expect(resultado).toEqual([{ id: 1, tipo: "saida" }]);
  });
});
