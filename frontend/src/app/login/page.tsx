"use client"
import { useState, useEffect } from 'react';
import LoginForm from '@/app/ui/login-form';
import RegisterForm from '@/app/ui/register-form';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (loginData) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loginData, router]);

  if (loginData) {
    return <div className="flex items-center justify-center min-h-screen text-green-700 text-xl font-bold">Login realizado com sucesso! Redirecionando...</div>;
  }

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Entrar</h1>
        {showRegister ? (
          <>
            <RegisterForm onRegisterSuccess={() => setShowRegister(false)} />
            <button
              className="mt-2 text-blue-600 underline"
              onClick={() => setShowRegister(false)}
            >
              Já tem conta? Entrar
            </button>
          </>
        ) : (
          <>
            <LoginForm onLoginSuccess={setLoginData} />
            <button
              className="mt-2 text-blue-600 underline"
              onClick={() => setShowRegister(true)}
            >
              Não tem conta? Cadastre-se
            </button>
          </>
        )}
      </div>
    </main>
  );
} 