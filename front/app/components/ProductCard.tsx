'use client';

import { Heart } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { ImageComponent } from './ImageComponent';
import { useFavorites } from '../context/FavoriteContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  urlImage?: string;
  isFavorited?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const NO_IMAGE_URL = '/images/notFound.jpg';

export function ProductCard({ product }: ProductCardProps) {
  const { addFavorite,removeFavorite,isFavorited } = useFavorites();
  const [imageUrl, setImageUrl] = useState(product.urlImage || NO_IMAGE_URL);

  const isProductFavorited = isFavorited(product._id);

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (isProductFavorited) {
      removeFavorite(product._id);
    } else {
      addFavorite(product._id);
    }
  };

  const handleImageError = () => {
    if (imageUrl !== NO_IMAGE_URL) {
      setImageUrl(NO_IMAGE_URL);
    }
  };

  return (
    <Link href={`/product/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden group transition-shadow hover:shadow-xl cursor-pointer">
        <div className="relative">
          <ImageComponent imageUrl={imageUrl} altText={product.name} productId={product._id}/>
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 bg-white/70 p-2 rounded-full backdrop-blur-sm transition hover:scale-110 z-10"
            aria-label="Favoritar produto"
          >
            <Heart
              size={20}
              className="text-gray-700"
              fill={isProductFavorited ? '#DC3545' : 'none'}
              color={isProductFavorited ? '#DC3545' : 'currentColor'}
            />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
          <p className="text-xl font-bold text-gray-800">
            R$ {(product.price?.toFixed(2) ?? '0,00').replace('.', ',')}
          </p>
        </div>
      </div>
    </Link>
  );
}