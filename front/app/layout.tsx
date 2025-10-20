import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/app/components/Navbar';
import { AuthProvider } from '@/app/context/AuthContext';
import { CartProvider } from '@/app/context/CartContext';
import { FavoriteProvider } from '@/app/context/FavoriteContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CapLink Store',
  description: 'Sua loja de e-commerce completa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <FavoriteProvider>
            <Navbar />
            <main>{children}</main>
            </FavoriteProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}