function HomePage() {
  return (
    <section>
      <h1>UsiEstoque DDA v1.0</h1>

      <p className="subtitulo">
        Gestão inteligente de estoque de pastilhas para usinagem.
      </p>

      <p>
        Solução para controle de pastilhas industriais, com acompanhamento de
        saldos, movimentações e necessidades de reposição.
      </p>

      <div className="cards">
        <article className="card">
          <h2>Controle de estoque</h2>
          <p>
            Acompanhamento de materiais, quantidades e locais de armazenamento.
          </p>
        </article>

        <article className="card">
          <h2>Rastreabilidade</h2>
          <p>Histórico de entradas, saídas e ajustes de estoque.</p>
        </article>

        <article className="card">
          <h2>Gestão de reposição</h2>
          <p>Identificação de materiais com estoque crítico.</p>
        </article>

        <article className="card">
          <h2>Relatórios gerenciais</h2>
          <p>Informações para apoiar decisões operacionais.</p>
        </article>
      </div>

      <p>Acesso ao sistema disponível para usuários autorizados.</p>
    </section>
  );
}

export default HomePage;
