import { useEffect, useState } from "react";
import api from "../api/api.js";

const formInicial = {
  tipo: "entrada",
  itemId: "",
  quantidade: 1,
  fornecedorId: "",
};

function MovementsPage() {
  const [catalogos, setCatalogos] = useState({
    itens: [],
    fornecedores: [],
  });

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

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
        if (ativo) {
          setErro(
            error.response?.data?.error ||
              "Não foi possível carregar as movimentações.",
          );
        }
      }
    }

    carregarInicial();

    return () => {
      ativo = false;
    };
  }, []);

  async function recarregar() {
    const [catalogosResp, movimentosResp] = await Promise.all([
      api.get("/movimentacoes/catalogos"),
      api.get("/movimentacoes"),
    ]);

    setCatalogos(catalogosResp.data);
    setMovimentacoes(movimentosResp.data);
  }

  function alterar(event) {
    const { name, value } = event.target;

    setForm((atual) => ({
      ...atual,
      [name]: value,
      ...(name === "tipo" && value === "saida" ? { fornecedorId: "" } : {}),
    }));
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
      });

      setMensagem("Movimentação registrada com sucesso.");
      setForm(formInicial);

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

        <select name="itemId" value={form.itemId} onChange={alterar} required>
          <option value="">Item</option>

          {catalogos.itens.map((item) => (
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

            {catalogos.fornecedores.map((fornecedor) => (
              <option key={fornecedor.id} value={fornecedor.id}>
                {fornecedor.nome}
              </option>
            ))}
          </select>
        )}

        <div>
          <button className="botao" disabled={salvando}>
            {salvando ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </form>

      {erro && <p className="mensagem-erro">{erro}</p>}

      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

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
            {movimentacoes.map((mov) => (
              <tr key={mov.id}>
                <td>{new Date(mov.criadoEm).toLocaleString("pt-BR")}</td>

                <td>{mov.item?.codigo}</td>

                <td>{mov.tipo === "entrada" ? "Entrada" : "Saída"}</td>

                <td>{mov.quantidade}</td>
                <td>{mov.saldoAnterior}</td>
                <td>{mov.saldoPosterior}</td>
                <td>{mov.fornecedor?.nome || "—"}</td>
                <td>{mov.usuario?.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MovementsPage;
