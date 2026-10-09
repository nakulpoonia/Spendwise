"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { clearAuth, getUser } from "../lib/auth";
import { AuthUser } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  setAuthenticatedUser: (user: AuthUser) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUser();

    setUser(storedUser);
    setIsLoading(false);
  }, []);

  function setAuthenticatedUser(user: AuthUser) {
    setUser(user);
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        logout,
        setAuthenticatedUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}