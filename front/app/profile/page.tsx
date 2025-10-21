'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { LoaderCircle, User, Package, UploadCloud, Mail, KeyRound, Trash2, History,List,PlusCircle } from 'lucide-react';
import { API_URL } from '@/app/config';


interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'Cliente' | 'Vendedor';
}

export default function ProfilePage() {
  const { token, user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const res = await fetch(`${API_URL}/users/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Falha ao buscar dados do perfil. Sessão pode ter expirado.');
        }

        const data: UserProfile = await res.json();
        setProfileData(data);
        setNewEmail(data.email);

      } catch (error) {
        console.error("Falha ao buscar perfil:", error);
        logout();
        router.push('/login');
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [token, isLoading, router, logout]);

  const handleUpdateEmail = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/users/${user?.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newEmail }),
    });

    if (!res.ok) {
      setFeedback({ type: 'error', message: 'Falha ao atualizar email.' });
      return;
    }
    setFeedback({ type: 'success', message: 'Email atualizado com sucesso!' });
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword === currentPassword) {
      setFeedback({ type: 'error', message: 'A nova senha não pode ser igual à senha atual.' });
      return;
    }
    const res = await fetch(`${API_URL}/users/password/${user?.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword }),
    });

    if (!res.ok) {
      setFeedback({ type: 'error', message: 'Falha ao atualizar senha.' });
      return;
    }
    setFeedback({ type: 'success', message: 'Senha atualizada com sucesso!' });
  };
  
  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja continuar? Esta ação não pode ser desfeita.')) {
      const res = fetch(`${API_URL}/users/${user?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      logout();
      router.push('/');
    }
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }
  
  if (!profileData) {
    return null;
  }

  return (
    <div className="bg-[#a19a9a] min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gray-200 p-3 rounded-full">
              <User className="w-10 h-10 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
              <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{profileData.role}</span>
            </div>
          </div>

          {profileData.role === 'Vendedor' && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package/> Ações de Vendedor</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/profile/dashboard" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <List size={20} />
                  Ver Dashboard
                </Link>
                <Link href="/profile/my-products" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <List size={20} />
                  Meus Produtos
                </Link>
                <Link href="/product/new-product" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                  <PlusCircle size={20} />
                  Cadastrar Novo Produto
                </Link>
              </div>
            </div>
          )}

          {profileData.role === 'Cliente' && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><History/> Minhas Compras</h2>
              <Link href="/profile/history" className="flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Ver Histórico de Compras
              </Link>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Mail/> Alterar Email</h2>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Novo Email</label>
                <input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 font-semibold text-white bg-primary rounded-lg bg-blue-700 hover:bg-blue-800 cursor-pointer">
                Salvar Email
              </button>
            </form>

            <hr/>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><KeyRound/> Alterar Senha</h2>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Senha Atual</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 font-semibold text-white bg-primary rounded-lg bg-blue-700 hover:bg-blue-800 cursor-pointer">
                Salvar Senha
              </button>
            </form>

            <hr/>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-error"><Trash2/> Deletar minha conta</h2>
              <p className="text-gray-600 my-2 text-sm">
                {profileData.role === 'Cliente' 
                  ? 'A exclusão da sua conta é permanente e removerá seus dados pessoais. Seu histórico de compras será mantido de forma anônima.'
                  : 'A desativação da sua conta irá ocultar todos os seus produtos da loja. Você poderá reativá-la no futuro.'
                }
              </p>
              <button onClick={handleDeleteAccount} className="px-4 py-2 font-semibold text-white bg-error rounded-lg bg-red-700 hover:bg-red-800 cursor-pointer">
                Desativar minha conta
              </button>
            </div>
          </div>
          
          {feedback.message && (
            <div className={`mt-4 p-4 rounded-md text-center ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback.message}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}