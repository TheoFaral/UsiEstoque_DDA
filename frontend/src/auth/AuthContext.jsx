import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { EVENTO_SESSAO_EXPIRADA } from "../api/api.js";
import { AuthContext } from "./authContext.js";

const CHAVE_TOKEN = "usiestoque_token";
const CHAVE_USUARIO = "usiestoque_usuario";

function expiracaoToken(token) {
  try {
    const parte = token.split(".")[1];
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const dados = JSON.parse(atob(base64));
    return typeof dados.exp === "number" ? dados.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function tokenValido(token) {
  return Boolean(token) && expiracaoToken(token) > Date.now();
}

function limparSessaoSalva() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

function carregarUsuarioInicial() {
  const token = localStorage.getItem(CHAVE_TOKEN);
  const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);

  if (!tokenValido(token) || !usuarioSalvo) {
    limparSessaoSalva();
    return null;
  }

  try {
    const usuario = JSON.parse(usuarioSalvo);
    if (
      !usuario ||
      !usuario.id ||
      !["administrador", "operador"].includes(usuario.perfil)
    ) {
      limparSessaoSalva();
      return null;
    }
    return usuario;
  } catch {
    limparSessaoSalva();
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(carregarUsuarioInicial);

  const logout = useCallback(() => {
    limparSessaoSalva();
    setUsuario(null);
  }, []);

  const encerrarSessaoExpirada = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  useEffect(() => {
    if (!usuario) return undefined;

    const verificarValidade = () => {
      if (!tokenValido(localStorage.getItem(CHAVE_TOKEN))) {
        encerrarSessaoExpirada();
      }
    };

    const token = localStorage.getItem(CHAVE_TOKEN);
    const tempoRestante = expiracaoToken(token) - Date.now();
    const timer = window.setTimeout(
      verificarValidade,
      Math.max(0, Math.min(tempoRestante, 2147483647)),
    );

    const aoRetomar = () => verificarValidade();
    const aoAlterarVisibilidade = () => {
      if (document.visibilityState === "visible") verificarValidade();
    };
    const aoReceber401 = (evento) => {
      if (evento.detail?.token === localStorage.getItem(CHAVE_TOKEN)) {
        encerrarSessaoExpirada();
      }
    };

    window.addEventListener("focus", aoRetomar);
    document.addEventListener("visibilitychange", aoAlterarVisibilidade);
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoReceber401);

    verificarValidade();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", aoRetomar);
      document.removeEventListener("visibilitychange", aoAlterarVisibilidade);
      window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoReceber401);
    };
  }, [usuario, encerrarSessaoExpirada]);

  const login = useCallback(async (email, senha) => {
    const { data } = await api.post("/auth/login", { email, senha });
    if (!tokenValido(data.token)) {
      throw new Error("A API retornou uma sessão inválida.");
    }
    localStorage.setItem(CHAVE_TOKEN, data.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }, []);

  const value = useMemo(
    () => ({ usuario, login, logout }),
    [usuario, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
