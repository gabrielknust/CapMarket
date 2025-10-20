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
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<UserPayload>(storedToken);

        // --- AQUI ESTÁ A LÓGICA DE VERIFICAÇÃO ---
        // O campo 'exp' é um timestamp UNIX em segundos.
        // Date.now() é em milissegundos, por isso a multiplicação por 1000.
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          // Se o token expirou, limpa tudo.
          console.log('Token expirado encontrado, limpando sessão.');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        } else {
          // Se o token ainda é válido, define o estado do usuário.
          setUser(decoded);
          setToken(storedToken);
        }
        // --- FIM DA LÓGICA DE VERIFICAÇÃO ---

      } catch (error) {
        // Se o token for malformado ou inválido, limpa tudo.
        console.error('Token inválido encontrado no localStorage:', error);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
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