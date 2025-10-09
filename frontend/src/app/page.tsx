"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Building2, 
  FileText, 
  DollarSign, 
  Star,
  Quote,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Smartphone,
  Globe,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Criação Rápida",
      description: "Crie orçamentos profissionais em minutos com nosso editor intuitivo e modelos personalizáveis."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestão de Clientes",
      description: "Mantenha todos os dados dos seus clientes organizados e acessíveis em um só lugar."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Relatórios Detalhados",
      description: "Acompanhe performance, taxa de aprovação e tome decisões baseadas em dados reais."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "PDFs Profissionais",
      description: "Gere orçamentos em PDF com sua marca, logo e informações personalizadas."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia e as melhores práticas de segurança."
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Acesso Mobile",
      description: "Interface responsiva que funciona perfeitamente em qualquer dispositivo."
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Consultora Freelancer",
      image: "M",
      quote: "Transformou completamente minha gestão de orçamentos. Agora consigo focar no que realmente importa: conquistar clientes!"
    },
    {
      name: "João Santos",
      role: "Arquiteto",
      image: "J", 
      quote: "A facilidade para criar orçamentos profissionais me ajudou a aumentar em 40% a taxa de aprovação dos meus projetos."
    },
    {
      name: "Ana Costa",
      role: "Designer Gráfica",
      image: "A",
      quote: "Interface intuitiva e recursos completos. Economizo horas por semana na gestão dos meus orçamentos."
    }
  ]

  const stats = [
    { number: "1000+", label: "Orçamentos Criados" },
    { number: "98%", label: "Satisfação" },
    { number: "24/7", label: "Suporte" },
    { number: "99.9%", label: "Uptime" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Easy Budget</span>
              <Badge variant="secondary" className="text-xs">v2.0</Badge>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Recursos</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Depoimentos</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Preços</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contato</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => router.push('/dashboard')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Acessar Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/login')} className="hidden sm:inline-flex">
                    Entrar
                  </Button>
                  <Button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Começar Grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-200 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Nova versão disponível
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Gerencie seus
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  Orçamentos
                </span>
                com Profissionalismo
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                A solução completa para freelancers e empresas criarem, gerenciarem e acompanharem 
                orçamentos de forma eficiente. Aumente sua taxa de aprovação e economize tempo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  onClick={handleGetStarted}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 h-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <>
                      Começar Gratuitamente
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                  <Award className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="flex -space-x-1 mr-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white"></div>
                    ))}
                  </div>
                  <span>Mais de 500 usuários satisfeitos</span>
                </div>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span>4.9/5 estrelas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Recursos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recursos poderosos e intuitivos para otimizar seu fluxo de trabalho e impressionar seus clientes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de sucesso de quem já transformou seus negócios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <Quote className="w-8 h-8 text-blue-500 mb-4" />
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.image}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/*
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              Preços Simples
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comece gratuitamente
            </h2>
            <p className="text-xl text-gray-600">
              Planos flexíveis que crescem com seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan 
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuito</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  R$ 0<span className="text-lg text-gray-600">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Até 10 orçamentos/mês
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    3 clientes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Geração de PDF
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Suporte por email
                  </li>
                </ul>
                <Button onClick={handleGetStarted} variant="outline" className="w-full">
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan 
            <Card className="border-2 border-blue-500 relative scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Mais Popular</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Profissional</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  R$ 29<span className="text-lg text-gray-600">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Orçamentos ilimitados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Clientes ilimitados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Relatórios avançados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Logo personalizada
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Suporte prioritário
                  </li>
                </ul>
                <Button onClick={handleGetStarted} className="w-full bg-blue-500 hover:bg-blue-600">
                  Começar Teste Grátis
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan 
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Empresa</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  R$ 99<span className="text-lg text-gray-600">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Tudo do Profissional
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Multi-usuários
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    API integrations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Suporte dedicado
                  </li>
                </ul>
                <Button onClick={handleGetStarted} variant="outline" className="w-full">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar seus orçamentos?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já otimizaram seu fluxo de trabalho e aumentaram suas vendas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 h-auto"
            >
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Easy Budget</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transformando a forma como profissionais gerenciam seus orçamentos.
              </p>
              <div className="flex space-x-4">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriais</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  contato@s.com
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  (11) 9999-9999
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  São Paulo, SP
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Easy Budget. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}