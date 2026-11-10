import axios from "axios";

export const EVENTO_SESSAO_EXPIRADA = "usiestoque:sessao-expirada";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("usiestoque_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const autorizado = error.config?.headers?.Authorization;
    const tokenDaRequisicao =
      typeof autorizado === "string"
        ? autorizado.replace(/^Bearer\s+/i, "")
        : null;

    if (error.response?.status === 401 && tokenDaRequisicao) {
      window.dispatchEvent(
        new CustomEvent(EVENTO_SESSAO_EXPIRADA, {
          detail: { token: tokenDaRequisicao },
        }),
      );
    }

    return Promise.reject(error);
  },
);

export default api;
