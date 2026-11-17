import { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../auth/useAuth.js";
import "../styles/etapa8.css";

const inicial = { nome: "", email: "", perfil: "operador", senha: "" };

export default function UsersPage() {
  const { usuario } = useAuth();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(inicial);
  const [id, setId] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function carregar() {
    const { data } = await api.get("/usuarios");
    setLista(data);
  }

  useEffect(() => {
    api
      .get("/usuarios")
      .then(({ data }) => setLista(data))
      .catch(() => setErro("Falha ao carregar usuários."));
  }, []);

  function cancelar() {
    setId(null);
    setForm(inicial);
  }

  function editar(u) {
    setId(u.id);
    setForm({
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      senha: "",
    });
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    setAviso("");

    try {
      if (id) {
        await api.put(`/usuarios/${id}`, form);
      } else {
        await api.post("/usuarios", form);
      }

      cancelar();
      await carregar();
      setAviso("Usuário salvo.");
    } catch (e) {
      setErro(e.response?.data?.error || "Falha ao salvar usuário.");
    }
  }

  async function inativar(u) {
    if (!window.confirm(`Inativar ${u.nome}?`)) return;

    setErro("");
    setAviso("");

    try {
      await api.patch(`/usuarios/${u.id}/inativar`);
      await carregar();
      setAviso("Usuário inativado.");
    } catch (e) {
      setErro(e.response?.data?.error || "Falha ao inativar usuário.");
    }
  }

  if (usuario?.perfil !== "administrador") {
    return <p>Acesso não autorizado.</p>;
  }

  return (
    <section className="e8-page">
      <h1>Gestão de usuários</h1>

      {erro && (
        <p role="alert" className="mensagem-erro">
          {erro}
        </p>
      )}
      {aviso && <p role="status">{aviso}</p>}

      <form className="e8-form" onSubmit={salvar}>
        <h2>{id ? "Editar usuário" : "Novo usuário"}</h2>

        <label>
          Nome
          <input
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </label>

        <label>
          E-mail
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

        <label>
          Perfil
          <select
            value={form.perfil}
            onChange={(e) => setForm({ ...form, perfil: e.target.value })}
          >
            <option value="operador">Operador</option>
            <option value="administrador">Administrador</option>
          </select>
        </label>

        <label>
          {id ? "Nova senha (opcional)" : "Senha"}
          <input
            type="password"
            required={!id}
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
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
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.perfil}</td>
                <td>{u.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                  {u.ativo && (
                    <>
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => editar(u)}
                      >
                        Editar
                      </button>

                      {u.id !== usuario.id && (
                        <button
                          className="link-button perigo"
                          type="button"
                          onClick={() => inativar(u)}
                        >
                          Inativar
                        </button>
                      )}
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
