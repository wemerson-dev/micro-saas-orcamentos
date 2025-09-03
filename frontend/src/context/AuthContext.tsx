'use client';
import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Novo estado de carregamento

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token") || null);
      setUserId(localStorage.getItem("userId") || null);
    }
    setIsLoading(false); // Define como falso após tentar carregar do localStorage
  }, []);

  const login = (newToken: string, newUserId: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", newUserId);
    setToken(newToken);
    setUserId(newUserId);
    console.log("AuthContext: Login realizado", { token: newToken, userId: newUserId });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
    console.log("AuthContext: Logout realizado");
  };

  if (isLoading) {
    return null; // Não renderiza nada enquanto estiver carregando para evitar hidratação incorreta
  }

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);