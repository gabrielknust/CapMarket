'use client';

import { notFound } from 'next/navigation';
import { ProductActions } from '@/app/components/ProductActions'; 
import { ImageComponent } from '@/app/components/ImageComponent';
import { API_URL } from '@/app/config';
import { useEffect, useState } from 'react';

interface ProductDetailPageProps {
  params: {
    productId: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  urlImage?: string;
  isFavorited?: boolean;
}

  async function getProduct(productId: string) {
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, { cache: 'no-store' });
      if (res.status === 404) {
        notFound();
      }
      if (!res.ok) throw new Error('Falha ao buscar produto');
      return res.json();
    } catch (error) {
      console.error(error);
      notFound();
    }
  }

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = params;
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const productData = await getProduct(productId);
      setProduct(productData);
    };

    fetchProduct();
  }, [productId]);

  if (!product) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-[#a19a9a] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-[#d1cccc] rounded-lg shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <ImageComponent 
            imageUrl={product.urlImage} 
            altText={product.name}
            productId={product._id}
            isFavoritedInitially={product.isFavorited}
          />
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {product.name}
            </h1>

            <p className="text-3xl font-light text-gray-700">
              R$ {product.price?.toFixed(2).replace('.', ',')}
            </p>
            
            <p className="text-gray-700 leading-relaxed mt-2"> 
              {product.description}
            </p>
            <div className="mt-auto">
              <ProductActions product={product} /> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}