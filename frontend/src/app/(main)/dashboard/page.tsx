"use client"
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  useAuth();
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Dashboard!</h1>
      <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Sair</button>
    </div>
  );
}
