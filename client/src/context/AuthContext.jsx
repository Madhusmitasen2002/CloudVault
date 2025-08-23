// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, setAccessToken } from "../api";
import { useNavigate, Navigate } from "react-router-dom";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (token) {
      setUser(auth.getUserFromToken());
    } else {
      setUser(null);
    }
    setReady(true);
  }, [token]);

  const login = async (email, password) => {
    const res = await auth.login(email, password);
    setAccessToken(res.token)
    setToken(res.token);
    nav("/");
    return res;
  };

  const signup = async (name, email, password) => {
    await auth.signup(name, email, password);
    await login(email, password);
  };

  const logout = () => {
    auth.logout();
    setToken(null);
    nav("/login");
  };

  const value = useMemo(() => ({ token, user, login, signup, logout }), [token, user]);
  if (!ready) return null;

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ----- Protected route -----
export function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
}
