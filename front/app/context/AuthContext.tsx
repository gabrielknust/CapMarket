'use client'; 

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
  id: string;
  role: string;
  exp?: number;
}

interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<UserPayload>(storedToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        } else {
          setUser(decoded);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Token inválido encontrado no localStorage:', error);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
      finally {
        setIsLoading(false);
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decoded = jwtDecode<UserPayload>(newToken);
    setUser(decoded);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}