'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/app/config';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cliente');
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
        body: JSON.stringify({ name, email, password, role }),
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 mt-1 text-gray-900 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${errors.name ? 'border-error' : 'border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 mt-1 text-gray-900 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${errors.senha ? 'border-error' : 'border-gray-300'}`}
            />
            {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
          </div>
          <fieldset>
            <div className="flex items-center gap-x-6">
              <div className="flex items-center gap-x-2">
                <input
                  id="cliente"
                  name="role"
                  type="radio"
                  value="Cliente"
                  checked={role === 'Cliente'}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 border-gray-400 text-primary focus:ring-primary"
                />
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">
                  Sou um cliente
                </label>
              </div>
              <div className="flex items-center gap-x-2">
                <input
                  id="vendedor"
                  name="role"
                  type="radio"
                  value="Vendedor"
                  checked={role === 'Vendedor'}
                  onChange={(e) => setRole(e.target.value)}
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