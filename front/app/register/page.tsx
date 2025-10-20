'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '../config';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState('Cliente');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, papel }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ api: data.message || 'Falha ao cadastrar.' });
        }
        return;
      }
      setSuccessMessage('Cadastro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setErrors({ api: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="w-full max-w-sm p-8 space-y-6 bg-gray-300 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Cadastre-se
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full px-3 py-2 mt-1 text-gray-900 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${errors.nome ? 'border-error' : 'border-gray-300'}`}
            />
            {errors.nome && <p className="mt-1 text-sm text-error">{errors.nome}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 mt-1 text-gray-900 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${errors.email ? 'border-error' : 'border-gray-300'}`}
            />
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`w-full px-3 py-2 mt-1 text-gray-900 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${errors.senha ? 'border-error' : 'border-gray-300'}`}
            />
            {errors.senha && <p className="mt-1 text-sm text-error">{errors.senha}</p>}
          </div>
          <fieldset>
            <div className="flex items-center gap-x-6">
              <div className="flex items-center gap-x-2">
                <input
                  id="cliente"
                  name="papel"
                  type="radio"
                  value="Cliente"
                  checked={papel === 'Cliente'}
                  onChange={(e) => setPapel(e.target.value)}
                  className="h-4 w-4 border-gray-400 text-primary focus:ring-primary"
                />
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">
                  Sou um cliente
                </label>
              </div>
              <div className="flex items-center gap-x-2">
                <input
                  id="vendedor"
                  name="papel"
                  type="radio"
                  value="Vendedor"
                  checked={papel === 'Vendedor'}
                  onChange={(e) => setPapel(e.target.value)}
                  className="h-4 w-4 border-gray-400 text-primary focus:ring-primary"
                />
                <label htmlFor="vendedor" className="block text-sm font-medium text-gray-700">
                  Sou um vendedor
                </label>
              </div>
            </div>
            {errors.papel && <p className="mt-1 text-sm text-error">{errors.papel}</p>}
          </fieldset>
          {successMessage && <p className="text-sm text-center text-success">{successMessage}</p>}
          {errors.api && <p className="text-sm text-center text-error">{errors.api}</p>}
          <p className="text-sm text-center text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </p>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-fit px-4 py-2 font-semibold a text-white rounded-lg bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}