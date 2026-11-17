import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section>
      <h1>Página não encontrada</h1>
      <p>O endereço informado não existe no sistema.</p>

      <Link to="/" className="botao">
        Voltar para a página inicial
      </Link>
    </section>
  );
}

export default NotFoundPage;
