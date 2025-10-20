'use client';

import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle, Edit } from 'lucide-react';
import { API_URL } from '@/app/config';


interface EditProductPageProps {
  params: {
    productId: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { user, token, isLoading:isAuthLoading } = useAuth();
  const router = useRouter();
  const { productId } = params;

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || !token || user.role !== 'Vendedor') {
      router.push('/');
      return;
    }

    const fetchProductData = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Produto não encontrado ou você não tem permissão para editá-lo.');
        }

        const product = await res.json();
        
        if (product.seller._id !== user.id) {
          throw new Error('Acesso negado.');
        }

        setNome(product.name);
        setPreco(product.price.toString());
        setDescricao(product.description);
        setUrlImagem(product.urlImage);

      } catch (error: any) {
        setFeedback({ type: 'error', message: error.message });
        setTimeout(() => router.push('/profile/my-products'), 2000);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchProductData();
  }, [user, token, isAuthLoading, router, productId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nome, price: parseFloat(preco), description: descricao, urlImage: urlImagem }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao atualizar o produto.');
      
      setFeedback({ type: 'success', message: 'Produto atualizado com sucesso!' });
      setTimeout(() => router.push('/profile/my-products'), 1500);

    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isPageLoading || isAuthLoading) {
    return <div className="flex justify-center items-center h-screen"><LoaderCircle className="animate-spin h-12 w-12"/></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Edit /> Editar Produto</h1>
          
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          <div>
            <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço</label>
            <input type="number" id="preco" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required rows={4} className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          <div>
            <label htmlFor="urlImagem" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
            <input type="url" id="urlImagem" value={urlImagem} onChange={(e) => setUrlImagem(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
          </div>
          
          {feedback.message && (
            <div className={`p-3 rounded-md text-center ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback.message}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-primary rounded-lg bg-blue-700 hover:bg-blue-800 cursor-pointer disabled:bg-gray-400">
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}