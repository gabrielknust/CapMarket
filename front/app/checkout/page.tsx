'use client';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { ImageComponent } from '../components/ImageComponent';
import { API_URL } from '../config';

export default function CheckoutPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const { cart, isLoading: isCartLoading } = useCart();
  const router = useRouter();

  const [rua, setRua] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthLoading || isCartLoading) {
      return;
    }
    if (!user) {
      router.push('/login');
    } else if (!cart || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [user, cart, isAuthLoading, isCartLoading, router]);

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      const shippingAddress = { rua, cidade, cep };
      const res = await fetch(`${API_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha ao finalizar o pedido.');
      }

      router.push(`/profile/history/`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthLoading || isCartLoading || !cart) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin h-12 w-12" />
      </div>
    );
  }

  const subtotal = cart.items.reduce((acc, item) => {
    const price = (item.product as any)?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Finalizar Compra</h1>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Endereço de Entrega</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="rua" className="block text-sm font-medium text-gray-700">Rua e Número</label>
                  <input type="text" id="rua" value={rua} onChange={(e) => setRua(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
                  <input type="text" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                  <input type="text" id="cep" value={cep} onChange={(e) => setCep(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {cart.items.map(item => (
                <div key={item.product._id} className="flex items-center gap-4">
                    <div className="w-16 h-16 flex-shrink-0">
                        <ImageComponent imageUrl={(item.product as any).urlImage || '/images/no-image.png'} altText={(item.product as any).name} productId={item.product._id} favorite={false}/>
                    </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{(item.product as any).name}</p>
                    <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                  </div>
                  <p className="font-medium">R$ {(((item.product as any).price || 0) * item.quantity).toFixed(2).replace('.', ',')}</p>
                </div>
              ))}
            </div>
            <hr className="my-4"/>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
              <div className="flex justify-between"><span>Frete</span><span>Grátis</span></div>
              <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
            </div>

            {error && <p className="mt-4 text-center text-sm text-error">{error}</p>}
            
            <button
              type="submit"
              disabled={isProcessing}
              className="mt-6 w-full flex items-center justify-center px-6 py-3 font-semibold text-white bg-primary rounded-lg bg-blue-700 disabled:bg-gray-400 hover:bg-blue-800 cursor-pointer"
            >
              {isProcessing ? <LoaderCircle className="animate-spin" /> : 'Finalizar Compra e Pagar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}