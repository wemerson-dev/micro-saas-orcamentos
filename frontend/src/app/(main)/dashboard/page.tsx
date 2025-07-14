"use client"
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  // O hook useAuth() para verificar a autenticação não é mais necessário aqui,
  // pois o middleware já protege esta página. Se o useAuth() também busca
  // dados do usuário, essa lógica pode ser mantida, mas a parte de
  // redirecionamento deve ser removida.
  // Para corrigir o problema imediato, removemos a chamada `useAuth()`.
  const router = useRouter();

  function logout() {
    // Remove os cookies de autenticação ao expirar a data deles
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Redireciona para a página de login usando o router do Next.js
    router.push('/login');
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Dashboard!</h1>
    </div>
  );
}
