'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

interface LoginFormProps {
  onLoginSuccess?: (data: LoginResponse) => void;
} 

const validarEmail = (email: string) =>
  /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(); // ✅ Usar signIn em vez de login
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    if (!validarEmail(email)) {
      setErro('Email inválido.');
      return;
    }
    
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    
    try {
      // ✅ Usar signIn do AuthContext (Supabase) em vez de API customizada
      const { error } = await signIn(email, senha);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErro('Email ou senha incorretos.');
        } else if (error.message.includes('Email not confirmed')) {
          setErro('Por favor, confirme seu email antes de fazer login.');
        } else {
          setErro(error.message || 'Erro ao fazer login.');
        }
        return;
      }

      // ✅ Login bem-sucedido - o AuthContext já gerencia token/sessão
      console.log('Login realizado com sucesso via Supabase');
      
      // ✅ Se houver callback de sucesso, criar dados compatíveis
      if (onLoginSuccess) {
        const mockData: LoginResponse = {
          token: 'supabase-managed',
          usuario: {
            id: 'supabase-user-id',
            nome: email, // Usar email como nome temporariamente
            email: email
          }
        };
        onLoginSuccess(mockData);
      }

      // ✅ Redirecionar para dashboard
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Erro durante login:', err);
      setErro('Erro inesperado ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {erro && <div className="text-red-600 text-sm">{erro}</div>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}