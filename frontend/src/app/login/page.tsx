"use client"
import { useState } from 'react';
import LoginForm from '@/app/ui/login-form';
import RegisterForm from '@/app/ui/register-form';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = (data: LoginResponse) => {
    // Após o sucesso do login, o formulário já salvou os cookies.
    // Agora, apenas redirecionamos o usuário para o dashboard.
    // Uma mensagem de sucesso pode ser mostrada com um "toast" ou notificação, se desejado.
    router.push('/dashboard');
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
            <LoginForm onLoginSuccess={handleLoginSuccess} />
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