import { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../auth/useAuth.js";
import "../styles/etapa8.css";

const opcoes = [
  { id: "tipos", nome: "Tipos de pastilha", extra: "descricao" },
  { id: "fabricantes", nome: "Fabricantes", extra: "contato" },
  { id: "fornecedores", nome: "Fornecedores", extra: "contato" },
  { id: "locais", nome: "Locais de armazenamento", extra: "descricao" },
];

export default function CadastrosPage() {
  const { usuario } = useAuth();

  const [categoria, setCategoria] = useState("tipos");
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ nome: "", extra: "" });
  const [id, setId] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const atual = opcoes.find((o) => o.id === categoria);

  useEffect(() => {
    let ativo = true;

    api
      .get(`/cadastros/${categoria}`)
      .then(({ data }) => {
        if (ativo) setLista(data);
      })
      .catch(() => {
        if (ativo) setErro("Falha ao carregar cadastros.");
      });

    return () => {
      ativo = false;
    };
  }, [categoria]);

  async function carregar() {
    const { data } = await api.get(`/cadastros/${categoria}`);
    setLista(data);
  }

  function cancelar() {
    setId(null);
    setForm({ nome: "", extra: "" });
  }

  function trocar(valor) {
    setCategoria(valor);
    cancelar();
    setErro("");
    setAviso("");
    setLista([]);
  }

  function editar(registro) {
    setId(registro.id);
    setForm({
      nome: registro.nome,
      extra: registro[atual.extra] || "",
    });
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    setAviso("");

    const dados = {
      nome: form.nome,
      [atual.extra]: form.extra,
    };

    try {
      if (id) {
        await api.put(`/cadastros/${categoria}/${id}`, dados);
      } else {
        await api.post(`/cadastros/${categoria}`, dados);
      }

      cancelar();
      await carregar();
      setAviso("Cadastro salvo.");
    } catch (e) {
      setErro(e.response?.data?.error || "Falha ao salvar cadastro.");
    }
  }

  async function inativar(registro) {
    if (!window.confirm(`Inativar ${registro.nome}?`)) return;

    setErro("");
    setAviso("");

    try {
      await api.patch(`/cadastros/${categoria}/${registro.id}/inativar`);

      await carregar();
      setAviso("Cadastro inativado.");
    } catch (e) {
      setErro(e.response?.data?.error || "Falha ao inativar cadastro.");
    }
  }

  if (usuario?.perfil !== "administrador") {
    return <p>Acesso não autorizado.</p>;
  }

  return (
    <section className="e8-page">
      <h1>Cadastros auxiliares</h1>

      <label>
        Escolha o cadastro
        <select value={categoria} onChange={(e) => trocar(e.target.value)}>
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
      </label>

      {erro && (
        <p role="alert" className="mensagem-erro">
          {erro}
        </p>
      )}

      {aviso && <p role="status">{aviso}</p>}

      <form className="e8-form" onSubmit={salvar}>
        <h2>
          {id ? "Editar" : "Novo"} - {atual.nome}
        </h2>

        <label>
          Nome
          <input
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </label>

        <label>
          {atual.extra === "contato" ? "Contato" : "Descrição"}
          <input
            value={form.extra}
            onChange={(e) => setForm({ ...form, extra: e.target.value })}
          />
        </label>

        <div className="e8-acoes">
          <button className="botao" type="submit">
            Salvar
          </button>

          <button className="botao-secundario" type="button" onClick={cancelar}>
            Cancelar
          </button>
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>{atual.extra === "contato" ? "Contato" : "Descrição"}</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {lista.map((r) => (
              <tr key={r.id}>
                <td>{r.nome}</td>
                <td>{r[atual.extra]}</td>
                <td>{r.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                  {r.ativo && (
                    <>
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => editar(r)}
                      >
                        Editar
                      </button>

                      <button
                        className="link-button perigo"
                        type="button"
                        onClick={() => inativar(r)}
                      >
                        Inativar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
