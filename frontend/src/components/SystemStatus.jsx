import { useEffect, useState } from "react";

import api from "../api/api.js";

function SystemStatus() {
  const [mensagem, setMensagem] = useState("Verificando API...");
  const [online, setOnline] = useState(false);

  useEffect(() => {
    api
      .get("/health")
      .then((response) => {
        setOnline(response.data.status === "ok");
        setMensagem(`API disponível - versão ${response.data.version}`);
      })
      .catch(() => {
        setOnline(false);
        setMensagem("API indisponível");
      });
  }, []);

  return (
    <article className="card">
      <h2>Status da API</h2>
      <div className={`status ${online ? "status-online" : "status-offline"}`}>
        {mensagem}
      </div>
    </article>
  );
}

export default SystemStatus;
