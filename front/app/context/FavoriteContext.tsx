'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { API_URL } from '@/app/config';

interface FavoriteApiResponse {
  _id: string;
  user: string;
  product: {
    _id: string;
  };
}

interface FavoriteContextType {
  favoriteProductIds: Set<string>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  isFavorited: (productId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(new Set());
  const { user, token } = useAuth();
  const router = useRouter();

  const fetchFavorites = useCallback(async () => {
    if (user && token) {
      try {
        const res = await fetch(`${API_URL}/favorites/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const favorites : FavoriteApiResponse[] = await res.json();
          const ids = new Set(favorites.map((fav) => fav.product._id));
          setFavoriteProductIds(ids);
        }
      } catch (error) {
        console.error("Falha ao buscar favoritos:", error);
      }
    } else {
      setFavoriteProductIds(new Set());
    }
  }, [user, token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (productId: string) => {
    if (!token) return;
    
    setFavoriteProductIds(prev => new Set(prev).add(productId));

    try {
      const res = await fetch(`${API_URL}/favorites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error('Falha ao favoritar');
      router.refresh(); 
    } catch (error) {
      console.error(error);
      setFavoriteProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeFavorite = async (productId: string) => {
    if (!token) return;

    setFavoriteProductIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });

    try {
      const res = await fetch(`${API_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao desfavoritar');
      router.refresh(); 
    } catch (error) {
      console.error(error);
      setFavoriteProductIds(prev => new Set(prev).add(productId));
    }
  };

  const isFavorited = (productId: string) => favoriteProductIds.has(productId);

  return (
    <FavoriteContext.Provider value={{ favoriteProductIds, addFavorite, removeFavorite, isFavorited }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
}