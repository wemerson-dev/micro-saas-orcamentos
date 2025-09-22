// src/app/login/page.tsx
"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Building2,
  Zap,
  Shield,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { signIn, signUp, resetPassword, loading, user } = useAuth();
  const router = useRouter();

  // Estados do formulário de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Estados do formulário de registro
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Estados do formulário de reset
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validações
  const [validations, setValidations] = useState({
    email: false,
    password: false,
    name: false,
    confirmPassword: false
  });

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      // Usar setTimeout para evitar conflitos de renderização
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Validar email
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validar senha
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Atualizar validações em tempo real
  useEffect(() => {
    setValidations({
      email: validateEmail(activeTab === 'login' ? loginData.email : registerData.email),
      password: validatePassword(activeTab === 'login' ? loginData.password : registerData.password),
      name: registerData.name.trim().length >= 2,
      confirmPassword: registerData.password === registerData.confirmPassword && registerData.confirmPassword.length > 0
    });
  }, [loginData, registerData, activeTab]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!validateEmail(loginData.email)) {
      setError('Por favor, insira um email válido.');
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(loginData.password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
        } else {
          setError(error.message || 'Erro ao fazer login. Tente novamente.');
        }
      } else {
        // Login bem-sucedido - o redirecionamento será feito pelo useEffect
        console.log('Login successful, awaiting redirect...');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Validações
    if (registerData.name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.');
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(registerData.email)) {
      setError('Por favor, insira um email válido.');
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(registerData.password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signUp(registerData.email, registerData.password, registerData.name);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login ou usar outro email.');
        } else {
          setError(error.message || 'Erro ao criar conta. Tente novamente.');
        }
      } else {
        setSuccess('Conta criada com sucesso! Verifique seu email para confirmar a conta.');
        setActiveTab('login');
        // Limpar formulário
        setRegisterData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(resetEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setError('Erro ao enviar email de recuperação. Tente novamente.');
      } else {
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setShowResetForm(false);
        setResetEmail('');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário estiver logado, não renderizar o formulário
  if (user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Logo e Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MicroSaaS Orçamentos</h1>
            <p className="text-gray-600">Gerencie seus orçamentos de forma profissional</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <button onClick={() => setError('')} className="text-red-800">
                  <span className="text-2xl">&times;</span>
                </button>
              </span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Sucesso!</strong>
              <span className="block sm:inline"> {success}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <button onClick={() => setSuccess('')} className="text-green-800">
                  <span className="text-2xl">&times;</span>
                </button>
              </span>
            </div>
          )}

          {/* Reset Password Form */}
          {showResetForm ? (
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Recuperar senha</CardTitle>
                <CardDescription>
                  Digite seu email para receber o link de recuperação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Enviar
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowResetForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Login/Register Tabs */
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar conta</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Bem-vindo de volta!</CardTitle>
                    <CardDescription>
                      Digite suas credenciais para acessar sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10"
                            required
                          />
                          {loginData.email && (
                            <div className="absolute right-3 top-3">
                              {validations.email ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
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
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShowResetForm(true)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Entrar
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Criar sua conta</CardTitle>
                    <CardDescription>
                      Comece a usar nossa plataforma hoje mesmo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Nome completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Seu nome completo"
                            value={registerData.name}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                            className="pl-10"
                            required
                          />
                          {registerData.name && (
                            <div className="absolute right-3 top-3">
                              {validations.name ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10"
                            required
                          />
                          {registerData.email && (
                            <div className="absolute right-3 top-3">
                              {validations.email ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
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
                        <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                          {registerData.confirmPassword && (
                            <div className="absolute right-10 top-3">
                              {validations.confirmPassword ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Criar conta
                      </Button>

                      <div className="text-center text-xs text-gray-500">
                        Ao criar uma conta, você concorda com nossos{' '}
                        <a href="/termos" className="text-blue-600 hover:text-blue-800">
                          Termos de Uso
                        </a>{' '}
                        e{' '}
                        <a href="/privacidade" className="text-blue-600 hover:text-blue-800">
                          Política de Privacidade
                        </a>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Lado direito - Apresentação do produto */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-8 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-purple-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Gerencie seus orçamentos com 
              <span className="text-yellow-300"> profissionalismo</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Uma solução completa para criar, gerenciar e acompanhar orçamentos de forma eficiente.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Criação Rápida</h3>
                <p className="text-blue-100">
                  Crie orçamentos profissionais em minutos com nosso editor intuitivo.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Gestão de Clientes</h3>
                <p className="text-blue-100">
                  Mantenha todos os dados dos seus clientes organizados em um só lugar.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Relatórios Detalhados</h3>
                <p className="text-blue-100">
                  Acompanhe performance e tome decisões baseadas em dados reais.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Segurança Total</h3>
                <p className="text-blue-100">
                  Seus dados protegidos com as melhores práticas de segurança.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">+1000</div>
              <div className="text-sm text-blue-100">Orçamentos criados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">98%</div>
              <div className="text-sm text-blue-100">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">24/7</div>
              <div className="text-sm text-blue-100">Suporte</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-blue-50 italic mb-4">
              "Transformou completamente a forma como gerencio meus orçamentos. 
              Agora consigo focar no que realmente importa: fazer negócios."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <div>
                <div className="font-semibold">Maria Silva</div>
                <div className="text-xs text-blue-200">Empresária</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
                