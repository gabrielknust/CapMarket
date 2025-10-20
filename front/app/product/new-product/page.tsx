'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { LoaderCircle, PackagePlus, UploadCloud } from 'lucide-react';
import { API_URL } from '@/app/config';

export default function NewProductPage() {
  const { user, token, isLoading:isAuthLoading } = useAuth();
  const router = useRouter();

  const [formType, setFormType] = useState<'manual' | 'csv'>('manual');

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [feedback, setFeedback] = useState({ type: '', message: '', details: [] as string[] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'Vendedor')) {
      router.push('/');
    }
  }, [user, isAuthLoading, router]);

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '', details: [] });

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name:nome, price: parseFloat(preco), description: descricao, urlImage : urlImagem, seller: user?.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao cadastrar o produto.');
      
      setFeedback({ type: 'success', message: 'Produto cadastrado com sucesso!', details: [] });
      setTimeout(() => router.push('/profile/my-products'), 1500);

    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message, details: [] });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCsvSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setFeedback({ type: 'error', message: 'Por favor, selecione um arquivo CSV.', details: [] });
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: '', message: '', details: [] });

    const formData = new FormData();
    formData.append('products-csv', csvFile);

    try {
        const res = await fetch(`${API_URL}/products/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Falha no upload do arquivo.');
        
        setFeedback({ 
          type: 'success', 
          message: `Processamento concluído: ${data.produtosCriados} produtos criados.`, 
          details: data.detalhesDosErros || [] 
        });

    } catch (error: any) {
        setFeedback({ type: 'error', message: error.message, details: [] });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  if (isAuthLoading || !user) {
    return <div className="flex justify-center items-center h-screen"><LoaderCircle className="animate-spin h-12 w-12"/></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6 flex border-b">
          <button 
            onClick={() => setFormType('manual')}
            className={`py-3 px-6 font-semibold transition-colors ${formType === 'manual' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <PackagePlus className="inline-block mr-2" size={20}/>
            Cadastro Manual
          </button>
          <button 
            onClick={() => setFormType('csv')}
            className={`py-3 px-6 font-semibold transition-colors ${formType === 'csv' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UploadCloud className="inline-block mr-2" size={20}/>
            Upload via CSV
          </button>
        </div>

        {formType === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Cadastrar Novo Produto</h1>
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
            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center bg-blue-700 hover:bg-blue-800 cursor-pointer text-white font-semibold px-4 py-2 rounded-md">
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Cadastrar Produto'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCsvSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Upload de Produtos via CSV</h1>
            <div>
              <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700">Arquivo CSV</label>
              <input type="file" id="csvFile" accept=".csv" onChange={handleFileChange} required className="w-full mt-1 p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
              <p className="text-xs text-gray-500 mt-2">O arquivo deve conter as colunas: name, price, description, urlImage.</p>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center bg-blue-700 hover:bg-blue-800 cursor-pointer text-white font-semibold px-4 py-2 rounded-md">
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Enviar Arquivo'}
            </button>
          </form>
        )}

        {feedback.message && (
          <div className={`mt-4 p-4 rounded-md ${feedback.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`${feedback.type === 'success' ? 'text-green-800' : 'text-red-800'} font-semibold`}>{feedback.message}</p>
            {feedback.details.length > 0 && (
              <ul className="list-disc list-inside text-sm text-red-700 mt-2">
                {feedback.details.map((detail, index) => <li key={index}>{detail}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}