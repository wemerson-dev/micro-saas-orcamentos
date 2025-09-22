'use client';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/toaster";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Aguardar um pouco mais para dar tempo ao AuthContext sincronizar após login
    const timer = setTimeout(() => {
      if (!loading && !user) {
        console.log('ClientLayout: User not authenticated, redirecting to login...');
        router.push('/login');
      }
    }, 300); // Pequeno delay para evitar corrida com login
    
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  // Mostrar loading enquanto verifica auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, não renderizar nada (redirecionamento em andamento)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Renderizar layout normal se autenticado
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger className="-m-1" />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </SidebarProvider>
  );
}