jest.mock("../../src/config/database", () => ({ query: jest.fn() }));
jest.mock("../../src/models", () => ({
  Movimentacao: { findOne: jest.fn() },
  Item: {},
  Fornecedor: {},
  Usuario: {},
}));

const sequelize = require("../../src/config/database");
const { Movimentacao } = require("../../src/models");
const {
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
        }),
      }),
    );
    expect(Movimentacao.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { chaveRequisicao: movimento.chaveRequisicao },
      }),
    );
    expect(resultado).toEqual(movimento);
  });
});
