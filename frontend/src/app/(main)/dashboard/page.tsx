'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard: Verificando token:', token);
    if (!token) {
      console.log('Dashboard: Token não encontrado, redirecionando para /login');
      router.push('/login');
    }
  }, [token, router]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao dashboard!</p>
    </div>
  );
}