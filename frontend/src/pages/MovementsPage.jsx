import { useEffect, useMemo, useState } from "react";
import api from "../api/api.js";

const formInicial = {
  tipo: "entrada",
  itemId: "",
  quantidade: 1,
  fornecedorId: "",
};
const filtrosIniciais = { itemId: "", tipo: "", dataInicio: "", dataFim: "" };

function formatarData(valor) {
  if (!valor) return "-";
  return new Date(valor).toLocaleString("pt-BR");
}

function MovementsPage() {
  const [catalogos, setCatalogos] = useState({ itens: [], fornecedores: [] });
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [buscaItem, setBuscaItem] = useState("");
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregarHistorico(filtrosAtuais = filtrosIniciais) {
    const params = Object.fromEntries(
      Object.entries(filtrosAtuais).filter(
        ([, valor]) => String(valor).trim() !== "",
      ),
    );
    const { data } = await api.get("/movimentacoes", { params });
    setMovimentacoes(data);
  }

  useEffect(() => {
    let ativo = true;
    async function carregarInicial() {
      try {
        const [catalogosResp, movimentosResp] = await Promise.all([
          api.get("/movimentacoes/catalogos"),
          api.get("/movimentacoes"),
        ]);
        if (ativo) {
          setCatalogos(catalogosResp.data);
          setMovimentacoes(movimentosResp.data);
        }
      } catch (error) {
        if (ativo)
          setErro(
            error.response?.data?.error ||
              "Não foi possível carregar as movimentações.",
          );
      }
    }
    carregarInicial();
    return () => {
      ativo = false;
    };
  }, []);

  const itensFiltrados = useMemo(() => {
    const termo = buscaItem.trim().toLowerCase();
    if (!termo) return catalogos.itens;
    return catalogos.itens.filter(
      (item) =>
        item.codigo.toLowerCase().includes(termo) ||
        item.descricao.toLowerCase().includes(termo),
    );
  }, [buscaItem, catalogos.itens]);

  const itemSelecionado = catalogos.itens.find(
    (item) => item.id === Number(form.itemId),
  );

  async function recarregar() {
    const catalogosResp = await api.get("/movimentacoes/catalogos");
    setCatalogos(catalogosResp.data);
    await carregarHistorico(filtros);
  }

  function alterar(event) {
    const { name, value } = event.target;
    setForm((atual) => ({
      ...atual,
      [name]: value,
      ...(name === "tipo" && value === "saida" ? { fornecedorId: "" } : {}),
    }));
  }

  function alterarFiltro(event) {
    const { name, value } = event.target;
    setFiltros((atual) => ({ ...atual, [name]: value }));
  }

  function cancelar() {
    setForm(formInicial);
    setBuscaItem("");
    setErro("");
    setMensagem("");
  }

  async function aplicarFiltros(event) {
    event.preventDefault();
    setErro("");
    try {
      await carregarHistorico(filtros);
    } catch (error) {
      setErro(
        error.response?.data?.error || "Não foi possível filtrar o histórico.",
      );
    }
  }

  async function limparFiltros() {
    setFiltros(filtrosIniciais);
    setErro("");
    try {
      await carregarHistorico(filtrosIniciais);
    } catch (error) {
      setErro(
        error.response?.data?.error || "Não foi possível carregar o histórico.",
      );
    }
  }

  async function registrar(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      await api.post("/movimentacoes", {
        itemId: Number(form.itemId),
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        fornecedorId:
          form.tipo === "entrada" ? Number(form.fornecedorId) : null,
        chaveRequisicao: crypto.randomUUID(),
      });
      setMensagem("Movimentação registrada com sucesso.");
      setForm(formInicial);
      setBuscaItem("");
      await recarregar();
    } catch (error) {
      setErro(
        error.response?.data?.error ||
          "Não foi possível registrar a movimentação.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <h1>Movimentações de estoque</h1>
      <p className="subtitulo">
        Registre entradas e saídas e acompanhe o histórico.
      </p>

      <form className="form-grid" onSubmit={registrar}>
        <h2>Nova movimentação</h2>
        <select name="tipo" value={form.tipo} onChange={alterar}>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <input
          type="search"
          placeholder="Buscar item por código ou descrição"
          value={buscaItem}
          onChange={(e) => setBuscaItem(e.target.value)}
        />
        <select name="itemId" value={form.itemId} onChange={alterar} required>
          <option value="">Selecione um item</option>
          {itensFiltrados.map((item) => (
            <option key={item.id} value={item.id}>
              {item.codigo} — {item.descricao} — saldo {item.saldoAtual}
            </option>
          ))}
        </select>
        <input
          name="quantidade"
          type="number"
          min="1"
          step="1"
          value={form.quantidade}
          onChange={alterar}
          required
        />
        {form.tipo === "entrada" && (
          <select
            name="fornecedorId"
            value={form.fornecedorId}
            onChange={alterar}
            required
          >
            <option value="">Fornecedor</option>
            {catalogos.fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        )}
        {itemSelecionado && (
          <p className="movimento-resumo">
            Saldo atual: <strong>{itemSelecionado.saldoAtual}</strong> | Mínimo:{" "}
            <strong>{itemSelecionado.estoqueMinimo}</strong>
          </p>
        )}
        <div className="acoes-movimento">
          <button className="botao" type="submit" disabled={salvando}>
            {salvando ? "Registrando..." : "Registrar"}
          </button>
          <button
            className="botao-secundario"
            type="button"
            onClick={cancelar}
            disabled={salvando}
          >
            Cancelar
          </button>
        </div>
      </form>

      {erro && <p className="mensagem-erro">{erro}</p>}
      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

      <section className="historico-bloco">
        <h2>Histórico</h2>
        <form className="filtros-historico" onSubmit={aplicarFiltros}>
          <select name="itemId" value={filtros.itemId} onChange={alterarFiltro}>
            <option value="">Todos os itens</option>
            {catalogos.itens.map((item) => (
              <option key={item.id} value={item.id}>
                {item.codigo} — {item.descricao}
              </option>
            ))}
          </select>
          <select name="tipo" value={filtros.tipo} onChange={alterarFiltro}>
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input
            name="dataInicio"
            type="date"
            value={filtros.dataInicio}
            onChange={alterarFiltro}
          />
          <input
            name="dataFim"
            type="date"
            value={filtros.dataFim}
            onChange={alterarFiltro}
          />
          <div className="acoes-filtro">
            <button className="botao" type="submit">
              Filtrar
            </button>
            <button
              className="botao-secundario"
              type="button"
              onClick={limparFiltros}
            >
              Limpar
            </button>
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Item</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Saldo anterior</th>
                <th>Saldo posterior</th>
                <th>Fornecedor</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.length === 0 && (
                <tr>
                  <td colSpan="8">
                    Nenhuma movimentação encontrada para os filtros informados.
                  </td>
                </tr>
              )}
              {movimentacoes.map((mov) => (
                <tr key={mov.id}>
                  <td>{formatarData(mov.criadoEm)}</td>
                  <td>{mov.item?.codigo}</td>
                  <td>{mov.tipo}</td>
                  <td>{mov.quantidade}</td>
                  <td>{mov.saldoAnterior}</td>
                  <td>{mov.saldoPosterior}</td>
                  <td>{mov.fornecedor?.nome || "-"}</td>
                  <td>{mov.usuario?.nome || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default MovementsPage;
