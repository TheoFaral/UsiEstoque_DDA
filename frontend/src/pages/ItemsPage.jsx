import { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../auth/useAuth.js";

const vazio = {
  codigo: "",
  descricao: "",
  tipoId: "",
  fabricanteId: "",
  localId: "",
  estoqueMinimo: 0,
};
const filtrosVazios = {
  busca: "",
  tipoId: "",
  fabricanteId: "",
  localId: "",
  situacao: "",
};

function ItemsPage() {
  const { usuario } = useAuth();
  const admin = usuario?.perfil === "administrador";
  const [itens, setItens] = useState([]);
  const [filtros, setFiltros] = useState(filtrosVazios);
  const [erro, setErro] = useState("");
  const [catalogos, setCatalogos] = useState({
    tipos: [],
    fabricantes: [],
    locais: [],
  });
  const [form, setForm] = useState(vazio);
  const [editando, setEditando] = useState(null);

  async function carregar(filtrosAtuais = filtrosVazios) {
    try {
      setErro("");
      const params = Object.fromEntries(
        Object.entries(filtrosAtuais).filter(([, v]) => v !== ""),
      );
      const { data } = await api.get("/itens", { params });
      setItens(data);
    } catch (error) {
      setErro(
        error.response?.data?.error || "Não foi possível carregar os itens.",
      );
    }
  }

  useEffect(() => {
    let ativo = true;
    async function carregarInicial() {
      try {
        const [respostaItens, respostaCatalogos] = await Promise.all([
          api.get("/itens"),
          api.get("/itens/catalogos"),
        ]);
        if (ativo) {
          setItens(respostaItens.data);
          setCatalogos(respostaCatalogos.data);
        }
      } catch (error) {
        if (ativo)
          setErro(
            error.response?.data?.error ||
              "Não foi possível carregar os dados.",
          );
      }
    }
    carregarInicial();
    return () => {
      ativo = false;
    };
  }, []);

  function alterar(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  function alterarFiltro(event) {
    setFiltros({ ...filtros, [event.target.name]: event.target.value });
  }
  function editar(item) {
    setEditando(item.id);
    setForm({
      codigo: item.codigo,
      descricao: item.descricao,
      tipoId: item.tipoId,
      fabricanteId: item.fabricanteId,
      localId: item.localId,
      estoqueMinimo: item.estoqueMinimo,
    });
  }
  function cancelar() {
    setEditando(null);
    setForm(vazio);
  }
  async function salvar(event) {
    event.preventDefault();
    try {
      setErro("");
      if (editando) await api.put(`/itens/${editando}`, form);
      else await api.post("/itens", form);
      cancelar();
      await carregar(filtros);
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível salvar o item.");
    }
  }
  async function inativar(id) {
    if (!window.confirm("Inativar este item?")) return;
    try {
      setErro("");
      await api.patch(`/itens/${id}/inativar`);
      await carregar(filtros);
    } catch (error) {
      setErro(
        error.response?.data?.error || "Não foi possível inativar o item.",
      );
    }
  }
  return (
    <section>
      <h1>Consulta de itens</h1>
      <p className="subtitulo">
        Usuário: {usuario?.nome} ({usuario?.perfil})
      </p>
      <form
        className="form-grid filtros-itens"
        onSubmit={(e) => {
          e.preventDefault();
          carregar(filtros);
        }}
      >
        <label>
          Busca por código ou descrição
          <input
            name="busca"
            placeholder="Código ou descrição"
            value={filtros.busca}
            onChange={alterarFiltro}
          />
        </label>
        <label>
          Tipo de pastilha
          <select name="tipoId" value={filtros.tipoId} onChange={alterarFiltro}>
            <option value="">Todos</option>
            {catalogos.tipos.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fabricante
          <select
            name="fabricanteId"
            value={filtros.fabricanteId}
            onChange={alterarFiltro}
          >
            <option value="">Todos</option>
            {catalogos.fabricantes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Local de armazenamento
          <select
            name="localId"
            value={filtros.localId}
            onChange={alterarFiltro}
          >
            <option value="">Todos</option>
            {catalogos.locais.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Situação de estoque
          <select
            name="situacao"
            value={filtros.situacao}
            onChange={alterarFiltro}
          >
            <option value="">Todas</option>
            <option value="normal">Normal</option>
            <option value="critico">Crítico</option>
          </select>
        </label>
        <div>
          <button className="botao" type="submit">
            Filtrar
          </button>{" "}
          <button
            type="button"
            className="botao secundario"
            onClick={() => {
              setFiltros(filtrosVazios);
              carregar(filtrosVazios);
            }}
          >
            Limpar
          </button>
        </div>
      </form>
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}
      {admin && (
        <form className="form-grid" onSubmit={salvar}>
          <h2>{editando ? "Editar item" : "Novo item"}</h2>
          <input
            name="codigo"
            placeholder="Código"
            value={form.codigo}
            onChange={alterar}
            required
          />
          <input
            name="descricao"
            placeholder="Descrição"
            value={form.descricao}
            onChange={alterar}
            required
          />
          <select name="tipoId" value={form.tipoId} onChange={alterar} required>
            <option value="">Tipo</option>
            {catalogos.tipos.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </select>
          <select
            name="fabricanteId"
            value={form.fabricanteId}
            onChange={alterar}
            required
          >
            <option value="">Fabricante</option>
            {catalogos.fabricantes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </select>
          <select
            name="localId"
            value={form.localId}
            onChange={alterar}
            required
          >
            <option value="">Local</option>
            {catalogos.locais.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </select>
          <input
            name="estoqueMinimo"
            type="number"
            min="0"
            value={form.estoqueMinimo}
            onChange={alterar}
          />
          <div>
            <button className="botao" type="submit">
              Salvar
            </button>{" "}
            {editando && (
              <button
                type="button"
                className="botao secundario"
                onClick={cancelar}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Fabricante</th>
              <th>Local</th>
              <th>Saldo</th>
              <th>Situação</th>
              {admin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => {
              const critico = item.saldoAtual <= item.estoqueMinimo;
              return (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.descricao}</td>
                  <td>{item.tipo?.nome}</td>
                  <td>{item.fabricante?.nome}</td>
                  <td>{item.local?.nome}</td>
                  <td>{item.saldoAtual}</td>
                  <td>
                    <span
                      className={
                        critico ? "badge badge-critico" : "badge badge-normal"
                      }
                    >
                      {critico ? "CRÍTICO" : "NORMAL"}
                    </span>
                  </td>
                  {admin && (
                    <td>
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => editar(item)}
                      >
                        Editar
                      </button>
                      <button
                        className="link-button perigo"
                        type="button"
                        onClick={() => inativar(item.id)}
                      >
                        Inativar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default ItemsPage;
