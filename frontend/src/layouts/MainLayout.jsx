import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

function MainLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="topo">
        <Link className="brand" to="/">
          UsiEstoque DDA
        </Link>

        <nav className="nav-actions">
          {usuario && <Link to="/itens">Itens</Link>}

          {usuario && <Link to="/movimentacoes">Movimentações</Link>}

          {usuario ? (
            <button className="link-button" onClick={sair}>
              Sair
            </button>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
        </nav>
      </header>

      <main className="conteudo">
        <Outlet />
      </main>

      <footer className="rodape">Projeto Aplicado IV</footer>
    </div>
  );
}

export default MainLayout;
