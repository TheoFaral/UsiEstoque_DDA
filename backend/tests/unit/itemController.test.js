jest.mock("../../src/models", () => ({
  Item: { findAll: jest.fn(), create: jest.fn(), findByPk: jest.fn() },
  TipoPastilha: { findOne: jest.fn(), findAll: jest.fn() },
  Fabricante: { findOne: jest.fn(), findAll: jest.fn() },
  LocalArmazenamento: { findOne: jest.fn(), findAll: jest.fn() },
}));
const models = require("../../src/models");
const controller = require("../../src/controllers/itemController");
function resp() {
  const res = { status: jest.fn(), json: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}
const dados = {
  codigo: "TESTE-E9",
  descricao: "Item teste",
  tipoId: 1,
  fabricanteId: 2,
  localId: 3,
  estoqueMinimo: 5,
};
beforeEach(() => {
  jest.clearAllMocks();
});

test("RF10: aceita filtros combinados e encaminha ao modelo", async () => {
  models.Item.findAll.mockResolvedValue([]);
  const res = resp();
  await controller.listar(
    {
      query: {
        tipoId: "1",
        fabricanteId: "2",
        localId: "3",
        situacao: "critico",
      },
    },
    res,
    jest.fn(),
  );
  expect(res.json).toHaveBeenCalledWith([]);
  const { where } = models.Item.findAll.mock.calls[0][0];
  expect(where).toMatchObject({
    ativo: true,
    tipoId: 1,
    fabricanteId: 2,
    localId: 3,
  });
});
test("RF10: rejeita identificador inválido", async () => {
  const res = resp();
  await controller.listar({ query: { tipoId: "abc" } }, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(400);
  expect(models.Item.findAll).not.toHaveBeenCalled();
});
test("RF10: rejeita situação inválida", async () => {
  const res = resp();
  await controller.listar(
    { query: { situacao: "indefinida" } },
    res,
    jest.fn(),
  );
  expect(res.status).toHaveBeenCalledWith(400);
});
test("RN07: rejeita criação com fabricante inativo/inexistente", async () => {
  models.TipoPastilha.findOne.mockResolvedValue({ id: 1 });
  models.Fabricante.findOne.mockResolvedValue(null);
  models.LocalArmazenamento.findOne.mockResolvedValue({ id: 3 });
  const res = resp();
  await controller.criar({ body: dados }, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(400);
  expect(models.Item.create).not.toHaveBeenCalled();
});
test("RN07: permite criação com vínculos ativos", async () => {
  models.TipoPastilha.findOne.mockResolvedValue({ id: 1 });
  models.Fabricante.findOne.mockResolvedValue({ id: 2 });
  models.LocalArmazenamento.findOne.mockResolvedValue({ id: 3 });
  models.Item.create.mockResolvedValue({ id: 99, ...dados });
  const res = resp();
  await controller.criar({ body: dados }, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(201);
  expect(models.Item.create).toHaveBeenCalledWith(
    expect.objectContaining({ saldoAtual: 0, ativo: true }),
  );
});
test("RN07: rejeita atualização com local inativo/inexistente", async () => {
  const update = jest.fn();
  models.Item.findByPk.mockResolvedValue({ id: 10, ativo: true, update });
  models.TipoPastilha.findOne.mockResolvedValue({ id: 1 });
  models.Fabricante.findOne.mockResolvedValue({ id: 2 });
  models.LocalArmazenamento.findOne.mockResolvedValue(null);
  const res = resp();
  await controller.atualizar(
    { params: { id: 10 }, body: dados },
    res,
    jest.fn(),
  );
  expect(res.status).toHaveBeenCalledWith(400);
  expect(update).not.toHaveBeenCalled();
});
