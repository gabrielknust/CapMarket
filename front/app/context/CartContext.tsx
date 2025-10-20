'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext'; 
import { API_URL } from '../config';
import { useRouter } from 'next/navigation';

interface CartContextType {
  cart: ICart | null;
  cartItemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
}

interface ICartItem {
  produto: { _id: string; nome: string };
  quantidade: number;
}
interface ICart {
  _id: string;
  usuario: string;
  items: ICartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ICart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, logout} = useAuth();
  const router = useRouter();

  const fetchCart = useCallback(async () => {
    if (user && token) {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/cart/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCart(data);
        } else if (res.status === 404) {
          setCart(null);
        } else {
          throw new Error('Falha ao buscar carrinho');
        }
      } catch (error) {
        console.error(error);
        setCart(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart(null);
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.status === 401 || res.status === 403) {
        alert('Sua sessão expirou. Por favor, faça o login novamente.');
        logout();
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao adicionar item ao carrinho');
      }

      const updatedCart = await res.json();
      setCart(updatedCart);

    } catch (error: any) {
      console.error(error);
      if (error.message.includes('Sua sessão expirou')) {
        return;
      }
      alert(error.message);
    }
  };

  const cartItemCount = cart?.items?.length || 0;

  return (
    <CartContext.Provider value={{ cart, cartItemCount, isLoading, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}