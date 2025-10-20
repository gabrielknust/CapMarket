'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

export function ProductActions({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  return (
    <div className="flex items-center gap-4 mt-6">
      <div className="flex items-center gap-2">
        <label htmlFor="quantity" className="font-semibold text-gray-700 whitespace-nowrap">
          Quantidade:
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-20 p-2 border border-gray-300 rounded-md text-center text-gray-700"
        />
      </div>

      <button 
        onClick={handleAddToCart}
        className="w-fit px-6 py-3 font-semibold text-white bg-primary rounded-lg bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-800"
      >
        <ShoppingCart size={20} />
        Adicionar ao Carrinho
      </button>
    </div>
  );
}