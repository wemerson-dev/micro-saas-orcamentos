'use client';
import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { supabase } from '@/lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import axios from 'axios';

interface ExtendedUser extends User {
  // Campos adicionais do backend
  nome?: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  numero?: string;
  cidade?: string;
  CEP?: string;
  UF?: string;
  avatar?: string;
  logo?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshUserData: () => Promise<void>; // ✅ Nova função para atualizar dados
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  token: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Função para buscar dados completos do backend
  const fetchUserProfile = async (accessToken: string, supabaseUser: User): Promise<ExtendedUser> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/usuario/perfil`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // ✅ Combinar dados do Supabase com dados do backend
      const combinedUser: ExtendedUser = {
        ...supabaseUser,
        // Dados do backend sobrescrevem dados do Supabase
        ...response.data,
        // Manter campos essenciais do Supabase
        id: supabaseUser.id,
        email: supabaseUser.email!,
        created_at: supabaseUser.created_at,
        updated_at: supabaseUser.updated_at,
      };

      console.log('AuthContext: User profile fetched from backend:', combinedUser.nome || combinedUser.email);
      return combinedUser;

    } catch (error) {
      console.warn('AuthContext: Failed to fetch user profile from backend, using Supabase data only:', error);
      // ✅ Fallback para dados do Supabase se backend falhar
      return supabaseUser as ExtendedUser;
    }
  };

  // ✅ Função pública para atualizar dados do usuário
  const refreshUserData = async () => {
    if (session?.access_token && session?.user) {
      const updatedUser = await fetchUserProfile(session.access_token, session.user);
      setUser(updatedUser);
    }
  };

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      console.log('AuthContext: Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthContext: Initial session:', session ? 'Found' : 'Not found');
      
      setSession(session);
      setToken(session?.access_token ?? null);
      
      if (session?.user) {
        // ✅ Buscar dados completos do backend
        const fullUser = await fetchUserProfile(session.access_token!, session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session ? `User: ${session.user?.email}` : 'No session');
        
        setSession(session);
        setToken(session?.access_token ?? null);
        
        if (session?.user) {
          // ✅ Buscar dados completos do backend
          const fullUser = await fetchUserProfile(session.access_token!, session.user);
          setUser(fullUser);
        } else {
          setUser(null);
        }
        
        // Sincronizar com localStorage e cookies
        if (session?.access_token && session?.user?.id) {
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('userId', session.user.id);
          
          document.cookie = `token=${session.access_token}; Path=/; Max-Age=28800; SameSite=Lax`;
          document.cookie = `userId=${session.user.id}; Path=/; Max-Age=28800; SameSite=Lax`;
          
          console.log('AuthContext: User session stored');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          
          document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
          document.cookie = 'userId=; Path=/; Max-Age=0; SameSite=Lax';
          
          console.log('AuthContext: User session cleared');
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Iniciando logout...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout no Supabase:', error);
        throw error;
      }
      
      // Limpar storage local e cookies
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'userId=; Path=/; Max-Age=0; SameSite=Lax';
      
      console.log('AuthContext: Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Limpar dados mesmo com erro
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'userId=; Path=/; Max-Age=0; SameSite=Lax';
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      token,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshUserData, // ✅ Expor função para componentes
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};