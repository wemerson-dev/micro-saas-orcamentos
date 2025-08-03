import { createContext, useContext, useState, ReactNode } from "react";

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
  const [token, setToken] = useState<string | null>(
    document.cookie
      .split("; ")
      .find(row => row.startsWith("token="))
      ?.split("=")[1] || null
  );
  const [userId, setUserId] = useState<string | null>(
    document.cookie
      .split("; ")
      .find(row => row.startsWith("userId="))
      ?.split("=")[1] || null
  );

  const login = (newToken: string, newUserId: string) => {
    const vToken = 24 * 60 * 60; // 24 horas
    document.cookie = `token=${newToken}; path=/; max-age=${vToken}; SameSite=Strict`;
    document.cookie = `userId=${newUserId}; path=/; max-age=${vToken}; SameSite=Strict`;
    setToken(newToken);
    setUserId(newUserId);
    console.log("AuthContext: Login realizado", { token: newToken, userId: newUserId });
  };

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "userId=; path=/; max-age=0";
    setToken(null);
    setUserId(null);
    console.log("AuthContext: Logout realizado");
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);