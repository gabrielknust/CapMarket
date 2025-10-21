'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, Calendar, DollarSign, ChevronRight } from 'lucide-react';
import { API_URL } from '@/app/config';

interface IOrder {
  _id: string;
  totalOrder: number;
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado';
  dateOrder: string;
  products: {
    _id: string;
    name: string;
    quantity: number;
  }[];
}

export default function PurchaseHistoryPage() {
  const { user, token, isLoading: isAuthLoading} = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!user || !token) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/order/user/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Falha ao buscar o histórico de compras.');
        }

        const data: IOrder[] = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, isAuthLoading, router]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Entregue':
        return 'bg-green-100 text-green-800';
      case 'Enviado':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin h-12 w-12" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Sem histórico de compras</h1>
        <p className="text-gray-600 mb-8">Você ainda não realizou nenhum pedido.</p>
        <Link href="/" className="px-6 py-3 font-semibold text-white bg-primary rounded-lg bg-blue-700 hover:bg-blue-800">
          Começar a Comprar
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#a19a9a] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Minhas Compras</h1>
          <div className="space-y-4">
            {orders.map((order) => (
              <Link href={`/order/${order._id}`} key={order._id} className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">Pedido #{order._id.substring(0, 8)}...</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Calendar size={14} />
                      {new Date(order.dateOrder).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <DollarSign size={16} />
                      {order.totalOrder.toFixed(2).replace('.', ',')}
                    </p>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                   <ChevronRight className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}