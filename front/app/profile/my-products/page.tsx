'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoaderCircle } from 'lucide-react';
import { API_URL } from '@/app/config';
import { ImageComponent } from '@/app/components/ImageComponent';

interface IProduct {
  _id: string;
  name: string;
  price: number;
  urlImage?: string;
}

export default function MyProductsPage() {
  const { user, token, isLoading: isAuthLoading} = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user || !token || user.role !== 'Vendedor') {
      router.push('/');
      return;
    }

    const fetchMyProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/seller/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Falha ao buscar seus produtos.');
        }
        const data: IProduct[] = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProducts();
  }, [user, token, isAuthLoading, router]);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    try {
        const res = await fetch(`${API_URL}/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Falha ao excluir o produto.');
        }
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
      } catch (error) {
        console.error(error);
      }
  };


  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Meus Produtos</h1>
          <Link href="/product/new-product/" className="px-4 py-2 font-semibold text-white bg-primary rounded-lg bg-blue-700 hover:bg-blue-800">
            + Adicionar Novo
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                    <ImageComponent imageUrl={product.urlImage} altText={product.name} productId={product._id} favorite={false}/>
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <button className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => router.push(`/product/edit/${product._id}`) }>Editar</button>
                    <button className="ml-4 text-sm text-red-600 hover:underline cursor-pointer" onClick={() => handleDeleteProduct(product._id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">Você ainda não cadastrou nenhum produto.</p>
          )}
        </div>
      </div>
    </div>
  );
}