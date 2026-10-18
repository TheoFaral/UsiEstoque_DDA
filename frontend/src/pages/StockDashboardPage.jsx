import { useEffect, useState } from "react";
import api from "../api/api.js";

const indicadoresIniciais = {
  totalItensAtivos: 0,
  semEstoque: 0,
  criticos: 0,
  normais: 0,
  saldoTotal: 0,
};

function StockDashboardPage() {
  const [alertas, setAlertas] = useState([]);
  const [indicadores, setIndicadores] = useState(indicadoresIniciais);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const [alertasResp, indicadoresResp] = await Promise.all([
          api.get("/estoque/alertas"),
          api.get("/estoque/indicadores"),
        ]);

        if (ativo) {
          setAlertas(alertasResp.data.alertas || []);
          setIndicadores(indicadoresResp.data);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error.response?.data?.error ||
              "Não foi possível carregar o painel de estoque.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section>
      <h1>Painel de estoque</h1>
      <p className="subtitulo">
        Acompanhe os indicadores e os itens que exigem atenção.
      </p>

      {carregando && <p>Carregando painel...</p>}
      {erro && <p className="mensagem-erro">{erro}</p>}

      {!carregando && !erro && (
        <>
          <div className="indicadores-grid">
            <article className="indicador-card">
              <span>Itens ativos</span>
              <strong>{indicadores.totalItensAtivos}</strong>
            </article>
            <article className="indicador-card">
              <span>Sem estoque</span>
              <strong>{indicadores.semEstoque}</strong>
            </article>
            <article className="indicador-card">
              <span>Críticos</span>
              <strong>{indicadores.criticos}</strong>
            </article>
            <article className="indicador-card">
              <span>Normais</span>
              <strong>{indicadores.normais}</strong>
            </article>
            <article className="indicador-card">
              <span>Saldo total</span>
              <strong>{indicadores.saldoTotal}</strong>
            </article>
          </div>

          <h2>Alertas de estoque</h2>

          {alertas.length === 0 ? (
            <p className="estado-vazio">Nenhum item em situação crítica.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Descrição</th>
                    <th>Saldo atual</th>
                    <th>Estoque mínimo</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((item) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default StockDashboardPage;
