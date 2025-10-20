'use client'; 

import { useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface ImageComponentProps {
  imageUrl?: string;
  altText: string;
  productId: string;
  isFavoritedInitially?: boolean;
  favorite?: boolean;
}

const PLACEHOLDER_IMAGE = '/images/notFound.jpg';

export function ImageComponent({ 
  imageUrl, 
  altText, 
  productId, 
  isFavoritedInitially = false, 
  favorite = true
}: ImageComponentProps) {
  const [currentSrc, setCurrentSrc] = useState(imageUrl || PLACEHOLDER_IMAGE);
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially); 

  const handleError = () => {
    setCurrentSrc(PLACEHOLDER_IMAGE);
  };

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setIsFavorited(!isFavorited);
    
    console.log(`Produto ${productId} ${!isFavorited ? 'favoritado' : 'desfavoritado'}!`);
  };

  return (
    <div className="relative w-full aspect-square bg-white rounded-md overflow-hidden shadow-md">
      <Image
        src={currentSrc}
        alt={altText}
        fill
        className="object-cover"
        priority
        onError={handleError}
      />
      {favorite && (
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 bg-white/70 p-2 rounded-full backdrop-blur-sm transition hover:scale-110 z-10 cursor-pointer"
        aria-label="Favoritar produto"
      >
        <Heart
          size={20}
          className="text-gray-700"
          fill={isFavorited ? '#DC3545' : 'none'}
          color={isFavorited ? '#DC3545' : 'currentColor'}
        />
      </button>
      )}
    </div>
  );
}