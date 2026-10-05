import SystemStatus from "../components/SystemStatus.jsx";

function HomePage() {
  return (
    <section>
      <h1>UsiEstoque DDA</h1>
      <p className="subtitulo">
        Primeira versão da interface do sistema de controle de estoque.
      </p>

      <div className="cards">
        <article className="card">
          <h2>O que já foi preparado</h2>
          <ul>
            <li>Frontend com React e Vite</li>
            <li>Rotas e layout responsivo</li>
            <li>API Express com rota de verificação</li>
            <li>Teste automatizado da rota health</li>
          </ul>
        </article>

        <SystemStatus />
      </div>
    </section>
  );
}

export default HomePage;
