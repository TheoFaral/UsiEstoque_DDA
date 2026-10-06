import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/itens");
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível entrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="login-page">
      <form className="form-card" onSubmit={submit}>
        <h1>Acesso ao sistema</h1>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />
        </label>

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button className="botao" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
