import { useEffect, useState } from "react";
import api from "../api/api.js";
import "../styles/etapa6.css";

const filtrosIniciais = {
  dataInicio: "",
  dataFim: "",
};

function ReportsPage() {
  const [relatorio, setRelatorio] = useState(null);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    api
      .get("/relatorios/resumo")
      .then((response) => {
        if (ativo) {
          setRelatorio(response.data);
        }
      })
      .catch((error) => {
        if (ativo) {
          setErro(
            error.response?.data?.error ||
              "Não foi possível carregar os relatórios.",
          );
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  async function carregarRelatorio(parametros = {}) {
    setCarregando(true);
    setErro("");

    try {
      const response = await api.get("/relatorios/resumo", {
        params: parametros,
      });

      setRelatorio(response.data);
    } catch (error) {
      setErro(
        error.response?.data?.error ||
          "Não foi possível carregar os relatórios.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function alterarFiltro(event) {
    const { name, value } = event.target;

    setFiltros((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  async function filtrar(event) {
    event.preventDefault();

    if (
      filtros.dataInicio &&
      filtros.dataFim &&
      filtros.dataFim < filtros.dataInicio
    ) {
      setErro("A data final deve ser igual ou posterior à data inicial.");
      return;
    }

    const parametros = {};

    if (filtros.dataInicio) {
      parametros.dataInicio = filtros.dataInicio;
    }

    if (filtros.dataFim) {
      parametros.dataFim = filtros.dataFim;
    }

    await carregarRelatorio(parametros);
  }

  async function limparFiltros() {
    setFiltros(filtrosIniciais);
    await carregarRelatorio();
  }

  if (carregando && !relatorio) {
    return (
      <section className="relatorios-page">
        <h1>Relatórios de estoque</h1>
        <p>Carregando relatórios...</p>
      </section>
    );
  }

  const indicadores = relatorio?.indicadores || {};
  const estoqueAtual = relatorio?.estoqueAtual || [];
  const consumoPorItem = relatorio?.consumoPorItem || [];
  const itensParaReposicao = relatorio?.itensParaReposicao || [];

  return (
    <section className="relatorios-page">
      <div className="relatorios-cabecalho">
        <div>
          <h1>Relatórios de estoque</h1>

          <p className="subtitulo">
            Consulte o saldo atual, o consumo e os itens que precisam de
            reposição.
          </p>
        </div>
      </div>

      <form className="relatorios-filtros" onSubmit={filtrar}>
        <div className="campo-relatorio">
          <label htmlFor="dataInicio">Data inicial</label>

          <input
            id="dataInicio"
            name="dataInicio"
            type="date"
            value={filtros.dataInicio}
            onChange={alterarFiltro}
          />
        </div>

        <div className="campo-relatorio">
          <label htmlFor="dataFim">Data final</label>

          <input
            id="dataFim"
            name="dataFim"
            type="date"
            value={filtros.dataFim}
            onChange={alterarFiltro}
          />
        </div>

        <div className="relatorios-acoes">
          <button className="botao" type="submit" disabled={carregando}>
            {carregando ? "Carregando..." : "Filtrar"}
          </button>

          <button
            className="botao-secundario"
            type="button"
            onClick={limparFiltros}
            disabled={carregando}
          >
            Limpar
          </button>
        </div>
      </form>

      {erro && <p className="mensagem-erro">{erro}</p>}

      <div className="relatorios-indicadores">
        <article className="relatorio-card">
          <span>Itens ativos</span>
          <strong>{indicadores.totalItensAtivos ?? 0}</strong>
        </article>

        <article className="relatorio-card">
          <span>Saldo total</span>
          <strong>{indicadores.saldoTotal ?? 0}</strong>
        </article>

        <article className="relatorio-card">
          <span>Para reposição</span>
          <strong>{indicadores.itensParaReposicao ?? 0}</strong>
        </article>

        <article className="relatorio-card">
          <span>Sem estoque</span>
          <strong>{indicadores.semEstoque ?? 0}</strong>
        </article>

        <article className="relatorio-card">
          <span>Movimentações</span>
          <strong>{indicadores.totalMovimentacoes ?? 0}</strong>
        </article>

        <article className="relatorio-card">
          <span>Entradas</span>
          <strong>{indicadores.totalEntradas ?? 0}</strong>
        </article>

        <article className="relatorio-card">
          <span>Saídas</span>
          <strong>{indicadores.totalSaidas ?? 0}</strong>
        </article>
      </div>

      <section className="relatorio-secao">
        <h2>Saldo atual dos itens</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Saldo</th>
                <th>Estoque mínimo</th>
                <th>Situação</th>
              </tr>
            </thead>

            <tbody>
              {estoqueAtual.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum item encontrado.</td>
                </tr>
              ) : (
                estoqueAtual.map((item) => (
                  <tr key={item.id}>
                    <td>{item.codigo}</td>
                    <td>{item.descricao}</td>
                    <td>{item.saldoAtual}</td>
                    <td>{item.estoqueMinimo}</td>
                    <td>
                      {item.situacaoEstoque === "sem_estoque"
                        ? "Sem estoque"
                        : item.situacaoEstoque === "critico"
                          ? "Crítico"
                          : "Normal"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="relatorio-secao">
        <h2>Consumo por item</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Quantidade de saída</th>
              </tr>
            </thead>

            <tbody>
              {consumoPorItem.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    Nenhuma saída encontrada no período informado.
                  </td>
                </tr>
              ) : (
                consumoPorItem.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.codigo}</td>
                    <td>{item.descricao}</td>
                    <td>{item.quantidadeSaida}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="relatorio-secao">
        <h2>Itens para reposição</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Saldo</th>
                <th>Estoque mínimo</th>
                <th>Situação</th>
              </tr>
            </thead>

            <tbody>
              {itensParaReposicao.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum item necessita de reposição.</td>
                </tr>
              ) : (
                itensParaReposicao.map((item) => (
                  <tr key={item.id}>
                    <td>{item.codigo}</td>
                    <td>{item.descricao}</td>
                    <td>{item.saldoAtual}</td>
                    <td>{item.estoqueMinimo}</td>
                    <td>
                      {item.situacaoEstoque === "sem_estoque"
                        ? "Sem estoque"
                        : "Crítico"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default ReportsPage;
