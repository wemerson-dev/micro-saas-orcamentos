// src/app/reset-password/page.tsx
"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se há um hash de recuperação de senha na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Definir a sessão com os tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      } as any);
    }
  }, []);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePassword(password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        if (error.message.includes('Same password')) {
          setError('A nova senha deve ser diferente da atual.');
        } else {
          setError(error.message || 'Erro ao atualizar senha. Tente novamente.');
        }
      } else {
        setSuccess('Senha atualizada com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Nova Senha</h1>
          <p className="text-gray-600">Digite sua nova senha abaixo</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <button onClick={() => setError('')} className="text-red-800">
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.759 3.15c.146.16.342.24.53.24.188 0 .384-.08.53-.24.148-.16.24-.36.24-.55 0-.19-.092-.39-.24-.55z"/></svg>
              </button>
            </span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              <strong className="font-bold">Sucesso!</strong>
              <span className="block sm:inline"> {success}</span>
            </div>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <button onClick={() => setSuccess('')} className="text-green-800">
                <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.759 3.15c.146.16.342.24.53.24.188 0 .384-.08.53-.24.148-.16.24-.36.24-.55 0-.19-.092-.39-.24-.55z"/></svg>
              </button>
            </span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              Escolha uma senha forte para proteger sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Mínimo 6 caracteres
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {confirmPassword && (
                    <div className="absolute right-10 top-3">
                      {password === confirmPassword ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Atualizar Senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}