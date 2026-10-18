import { useEffect, useState } from "react";
import api from "../api/api.js";

function StockDashboardPage() {
  const [alertas, setAlertas] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await api.get("/estoque/alertas");
        if (ativo) setAlertas(resposta.data.alertas || []);
      } catch (error) {
        if (ativo) {
          setErro(
            error.response?.data?.error ||
              "Não foi possível carregar os alertas de estoque.",
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
        Itens com saldo igual ou abaixo do estoque mínimo.
      </p>

      {carregando && <p>Carregando alertas...</p>}
      {erro && <p className="mensagem-erro">{erro}</p>}

      {!carregando && !erro && alertas.length === 0 && (
        <p className="estado-vazio">Nenhum item em situação crítica.</p>
      )}

      {!carregando && !erro && alertas.length > 0 && (
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
    </section>
  );
}

export default StockDashboardPage;
