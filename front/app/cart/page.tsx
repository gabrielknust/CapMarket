'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { ImageComponent } from '@/app/components/ImageComponent';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { user, isLoading: isAuthLoading} = useAuth();
  const { cart, isLoading: isCartLoading, updateItemQuantity, removeItemFromCart } = useCart();
  const router = useRouter();

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading || isCartLoading) {
      return;
    }
    if (!user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h1>
        <p className="text-gray-600 mb-8">
          Parece que você ainda não adicionou nenhum produto.
        </p>
        <Link href="/" className="px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-blue-700">
          Continuar Comprando
        </Link>
      </div>
    );
  }
  
  const subtotal = cart.items.reduce((acc, item) => {
    const price = (item.product as any)?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 0) return;
    setUpdatingItemId(productId);
    await updateItemQuantity(productId, quantity);
    setUpdatingItemId(null);
  };

  const handleRemoveItem = async (productId: string) => {
    setUpdatingItemId(productId);
    await removeItemFromCart(productId);
    setUpdatingItemId(null);
  };

  return (
    <div className="bg-[#a19a9a] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3 space-y-4">
            {cart.items.map((item) => (
                <div key={item.product._id} className={`flex bg-white p-4 rounded-lg shadow-sm items-center gap-4 transition-opacity ${updatingItemId === item.product._id ? 'opacity-50' : ''}`}>
                    <div className="w-24 h-24 flex-shrink-0">
                        <ImageComponent
                        imageUrl={(item.product as any).urlImage}
                        altText={(item.product as any).name}
                        productId={(item.product as any)._id}
                        />
                    </div>
                <div className="flex-grow">
                  <h2 className="font-semibold">{(item.product as any).name}</h2>
                  <p className="text-gray-600">R$ {((item.product as any).price || 0).toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.product._id, parseInt(e.target.value))}
                    className="w-16 p-2 border rounded-md text-center"
                  />
                  <button 
                    onClick={() => handleRemoveItem(item.product._id)} 
                    className="text-gray-500 hover:text-error cursor-pointer"
                    title="Remover item"
                    disabled={updatingItemId === item.product._id}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Frete</span>
                <span>Grátis</span>
              </div>
              <hr className="my-4"/>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <Link href="/checkout" className="mt-6 w-full block text-center px-6 py-3 font-semibold text-white bg-primary rounded-lg bg-blue-700 hover:bg-blue-800">
                Finalizar Compra
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}