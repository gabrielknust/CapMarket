'use client';

import Link from 'next/link';
import { SearchBar } from './SearchBar';
import { useAuth } from '../context/Auth';

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    alert('Logout realizado!');
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