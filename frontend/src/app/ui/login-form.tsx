'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Ajuste o caminho
//import { useRouter } from 'next/navigation'; // Ou useRouter para Next.js
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
  onLoginSuccess?: (data: LoginResponse) => void; // Tornar opcional
} 

const validarEmail = (email: string) =>
  /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  //const router = useRouter(); // Ou useRouter para Next.js

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/usuario/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        setErro(errorData.erro || 'Email ou senha inválidos.');
        return;
      }
      const data: LoginResponse = await res.json();
      console.log('Resposta do login:', data);

      // Salvar token e userId usando AuthContext
      login(data.token, data.usuario.id);

      // Também salvar em cookies para que Middleware e layouts no servidor consigam ler
      const maxAgeSeconds = 60 * 60 * 8; // 8 horas (mesmo do backend)
      try {
        document.cookie = `token=${data.token}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
        document.cookie = `userId=${data.usuario.id}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
      } catch (cookieErr) {
        console.warn('Falha ao escrever cookies:', cookieErr);
      }

      // Chamar onLoginSuccess, se fornecido
      if (onLoginSuccess) {
        console.log('Chamando onLoginSuccess com:', data);
        onLoginSuccess(data);
      }

      // Redirecionar para a página de perfil
      //router.push('/dashboard');
    } catch (err) {
      console.error('Erro ao conectar com o servidor:', err);
      setErro(err instanceof Error ? `Erro ao conectar com o servidor: ${err.message}` : 'Erro ao conectar com o servidor.');
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