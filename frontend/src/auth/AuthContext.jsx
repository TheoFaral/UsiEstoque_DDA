import { createContext, useMemo, useState } from "react";
import api from "../api/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem("usiestoque_usuario");

    return raw ? JSON.parse(raw) : null;
  });

  async function login(email, senha) {
    const { data } = await api.post("/auth/login", {
      email,
      senha,
    });

    localStorage.setItem("usiestoque_token", data.token);

    localStorage.setItem("usiestoque_usuario", JSON.stringify(data.usuario));

    setUsuario(data.usuario);
  }

  function logout() {
    localStorage.removeItem("usiestoque_token");
    localStorage.removeItem("usiestoque_usuario");
    setUsuario(null);
  }

  const value = useMemo(
    () => ({
      usuario,
      login,
      logout,
    }),
    [usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
