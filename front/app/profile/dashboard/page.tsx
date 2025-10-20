'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, DollarSign, Hash, Package, TrendingUp } from 'lucide-react';
import { API_URL } from '@/app/config';
import { ElementType, FC } from 'react';

interface DashboardData {
  totalProductsRegistered: number;
  totalRevenue: number;
  totalProductsSold: number;
  bestSellingProduct: {
    name: string;
    totalQuantitySold: number;
  } | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className="bg-blue-100 text-primary p-3 rounded-full">
            <Icon className="w-6 h-6" />
            </div>
            <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

export default function SellerDashboardPage() {
  const { user, token, isLoading:isAuthLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || !token || user.role !== 'Vendedor') {
      router.push('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/seller`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Falha ao buscar dados do dashboard.');
        const dashboardData: DashboardData = await res.json();
        setData(dashboardData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token, isAuthLoading, router]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin h-12 w-12" />
      </div>
    );
  }
  
  if (!data) {
    return <div className="text-center py-20">Não foi possível carregar os dados.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard do Vendedor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Faturamento Total" 
            value={`R$ ${data.totalRevenue.toFixed(2).replace('.', ',')}`} 
            icon={DollarSign}
          />
          <StatCard 
            title="Total de Produtos Vendidos" 
            value={data.totalProductsSold} 
            icon={Hash}
          />
          <StatCard 
            title="Produtos Cadastrados" 
            value={data.totalProductsRegistered} 
            icon={Package}
          />
          <StatCard 
            title="Produto Mais Vendido" 
            value={data.bestSellingProduct?.name || 'N/A'}
            icon={TrendingUp}
          />
        </div>
        
        {/* Adicione outros componentes aqui, como gráficos ou uma lista dos últimos pedidos */}
        <div className="mt-8">
          <Link href="/profile/my-products" className="font-semibold text-primary hover:underline">
            Ver todos os meus produtos →
          </Link>
        </div>
      </div>
    </div>
  );
}