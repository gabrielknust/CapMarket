'use client';

import Link from 'next/link';
import { SearchBar } from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (  
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              CapLink Store
            </Link>
          </div>
          <div className="w-full max-w-md hidden md:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            {user ? (
              <>
                {user.role === 'Cliente' && (
                  <Link href="/cart" className="relative hover:text-gray-300 transition-colors" title="Carrinho">
                    <ShoppingCart />
                    {cartItemCount > 0 && (
                      <span 
                        className="
                          absolute -top-1 right-2 transform -translate-y-1/2 translate-x-1/2 // <-- MUDANÇA AQUI
                          h-5 min-w-[1.25rem] px-1 rounded-full 
                          bg-primary text-white text-xs font-semibold 
                          flex items-center justify-center
                          border border-gray-800
                        "
                      >
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link href="/profile" className="hover:text-gray-300 transition-colors">
                  Meu Perfil
                </Link>
                <button onClick={handleLogout} className="hover:text-gray-300 transition-colors cursor-pointer">
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" className="font-semibold hover:text-gray-300 transition-colors">
                Entrar
              </Link>
            )}
          </div>
        </div>
        <div className="mt-4 md:hidden">
            <SearchBar />
        </div>
      </div>
    </header>
  );
}