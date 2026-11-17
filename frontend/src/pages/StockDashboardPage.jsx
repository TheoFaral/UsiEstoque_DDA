import { useCallback, useEffect, useState } from "react";
import api from "../api/api.js";

const indicadoresIniciais = {
  totalItensAtivos: 0,
  semEstoque: 0,
  criticos: 0,
  normais: 0,
  saldoTotal: 0,
};

const nomesTipos = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste_entrada: "Ajuste de entrada",
  ajuste_saida: "Ajuste de saída",
};

function formatarData(valor) {
  if (!valor) return "—";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";

  return data.toLocaleString("pt-BR");
}

function StockDashboardPage() {
  const [alertas, setAlertas] = useState([]);
  const [indicadores, setIndicadores] = useState(indicadoresIniciais);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async (signal) => {
    setCarregando(true);
    setErro("");

    try {
      const [alertasResp, indicadoresResp, movimentacoesResp] =
        await Promise.all([
          api.get("/estoque/alertas", { signal }),
          api.get("/estoque/indicadores", { signal }),
          api.get("/movimentacoes", { signal }),
        ]);

      if (signal?.aborted) return;

      setAlertas(alertasResp.data.alertas || []);
      setIndicadores(indicadoresResp.data);
      setMovimentacoes(
        Array.isArray(movimentacoesResp.data)
          ? movimentacoesResp.data.slice(0, 10)
          : [],
      );
    } catch (error) {
      if (signal?.aborted || error.code === "ERR_CANCELED") return;

      setErro(
        error.response?.data?.error ||
          "Não foi possível carregar o painel de estoque.",
      );
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarInicialmente() {
      try {
        const [alertasResp, indicadoresResp, movimentacoesResp] =
          await Promise.all([
            api.get("/estoque/alertas", { signal: controller.signal }),
            api.get("/estoque/indicadores", { signal: controller.signal }),
            api.get("/movimentacoes", { signal: controller.signal }),
          ]);

        if (controller.signal.aborted) return;

        setAlertas(alertasResp.data.alertas || []);
        setIndicadores(indicadoresResp.data);
        setMovimentacoes(
          Array.isArray(movimentacoesResp.data)
            ? movimentacoesResp.data.slice(0, 10)
            : [],
        );
      } catch (error) {
        if (controller.signal.aborted || error.code === "ERR_CANCELED") return;

        setErro(
          error.response?.data?.error ||
            "Não foi possível carregar o painel de estoque.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    void carregarInicialmente();

    return () => controller.abort();
  }, []);

  return (
    <section>
      <h1>Painel de estoque</h1>

      <p className="subtitulo">
        Acompanhe os indicadores e os itens que exigem atenção.
      </p>

      <button
        type="button"
        onClick={() => void carregar()}
        disabled={carregando}
      >
        {carregando ? "Atualizando..." : "Atualizar painel"}
      </button>

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

          <h2>Movimentações recentes</h2>

          {movimentacoes.length === 0 ? (
            <p className="estado-vazio">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Item</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Usuário</th>
                  </tr>
                </thead>

                <tbody>
                  {movimentacoes.map((movimentacao) => (
                    <tr key={movimentacao.id}>
                      <td>{formatarData(movimentacao.criadoEm)}</td>
                      <td>{movimentacao.item?.codigo || "—"}</td>
                      <td>
                        {nomesTipos[movimentacao.tipo] || movimentacao.tipo}
                      </td>
                      <td>{movimentacao.quantidade}</td>
                      <td>{movimentacao.usuario?.nome || "—"}</td>
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
