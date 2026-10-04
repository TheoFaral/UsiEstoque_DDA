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
            <li>Estrutura do frontend</li>
            <li>Rotas iniciais</li>
            <li>Layout responsivo</li>
          </ul>
        </article>

        <article className="card">
          <h2>Integração com a API</h2>
          <p>A conexão com o backend será adicionada no próximo bloco.</p>
        </article>
      </div>
    </section>
  );
}

export default HomePage;
