import { Link, Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="app">
      <header className="topo">
        <Link to="/" className="logo">
          UsiEstoque DDA
        </Link>
        <span>Controle de pastilhas</span>
      </header>

      <main className="conteudo">
        <Outlet />
      </main>

      <footer className="rodape">Projeto Aplicado IV</footer>
    </div>
  );
}

export default MainLayout;
