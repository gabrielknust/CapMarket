'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from './components/ProductCard';
import { SearchBar } from './components/SearchBar';
import { LoaderCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {API_URL} from './config';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const url = new URL(`${API_URL}/products`);
        url.searchParams.append('page', currentPage.toString());
        if (searchTerm) {
          url.searchParams.append('search', searchTerm);
        }
        
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Falha ao buscar produtos');
        
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error(error);
        setProducts([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, currentPage]);

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  return (
    <div className="bg-gray-800">
      <div className="container mx-auto px-4 pt-6 pb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <main className="bg-gray-100 min-h-screen rounded-t-2xl p-4 md:p-8">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <div className="flex justify-center items-center gap-4 mt-8">
                <button 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-white rounded-md shadow-sm disabled:opacity-50 cursor-pointer" 
                >
                  <ChevronLeft/>
                </button>
                <span className="font-semibold">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-white rounded-md shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <ChevronRight/>
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-20">Nenhum produto encontrado.</p>
          )}
        </div>
      </main>
    </div>
  );
}