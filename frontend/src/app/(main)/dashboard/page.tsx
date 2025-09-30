'use client'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"   
import { SidebarInset } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { 
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    DollarSign,
    Calendar,
    Plus,
    Eye,
    Download,
    RefreshCw,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Send,
    Edit,
    Building2,
    Mail,
    Phone,
    MapPin,
    Target,
    Activity,
    PieChart,
    LineChart,
    Zap,
    Star,
    Award,
    Bell,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
} from "lucide-react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import axios from "axios"
import { cn } from "@/lib/utils"

interface DashboardStats {
    totalOrcamentos: number
    orcamentosAprovados: number
    orcamentosRejeitados: number
    orcamentosPendentes: number
    totalClientes: number
    clientesAtivos: number
    valorTotalMes: number
    valorAprovadoMes: number
    valorPendenteMes: number
    taxaAprovacao: number
    ticketMedio: number
    crescimentoMes: number
    metaMensal: number
    progressoMeta: number
}

interface RecentActivity {
    id: string
    tipo: 'orcamento_criado' | 'orcamento_aprovado' | 'cliente_cadastrado' | 'orcamento_enviado'
    titulo: string
    descricao: string
    data: string
    valor?: number
    cliente?: string
    status?: string
}

interface TopCliente {
    id: string
    nome: string
    email: string
    totalOrcamentos: number
    valorTotal: number
    ultimoOrcamento: string
    avatar?: string
}

interface ChartData {
    mes: string
    orcamentos: number
    valor: number
    aprovados: number
}

export default function DashboardPage() {
    const { token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    
    // Estados principais
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>("")
    const [refreshing, setRefreshing] = useState<boolean>(false)
    
    // Estados dos dados
    const [stats, setStats] = useState<DashboardStats>({
        totalOrcamentos: 0,
        orcamentosAprovados: 0,
        orcamentosRejeitados: 0,
        orcamentosPendentes: 0,
        totalClientes: 0,
        clientesAtivos: 0,
        valorTotalMes: 0,
        valorAprovadoMes: 0,
        valorPendenteMes: 0,
        taxaAprovacao: 0,
        ticketMedio: 0,
        crescimentoMes: 0,
        metaMensal: 50000,
        progressoMeta: 0
    })
    
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
    const [topClientes, setTopClientes] = useState<TopCliente[]>([])
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [currentTab, setCurrentTab] = useState("visao-geral")
    
    // Formatação de valores
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR')
    }

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Carregar dados do dashboard
    const loadDashboardData = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            setError("")
            
            if (!token) {
                router.push('/login')
                return
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            
            // Carregar dados em paralelo
            const [
                orcamentosRes,
                clientesRes
            ] = await Promise.all([
                axios.get(`${apiUrl}/Orcamento/listar`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${apiUrl}/Cliente/listar`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            // Processar estatísticas dos orçamentos
            const orcamentos = orcamentosRes.data || []
            const clientes = clientesRes.data || []
            
            const statsCalculadas = processarEstatisticas(orcamentos, clientes)
            setStats(statsCalculadas)
            
            // Processar atividades recentes
            const atividades = processarAtividades(orcamentos, clientes)
            setRecentActivities(atividades)
            
            // Top clientes
            const topClientesCalculados = processarTopClientes(orcamentos, clientes)
            setTopClientes(topClientesCalculados)
            
            // Dados do gráfico (últimos 6 meses)
            const dadosGrafico = processarDadosGrafico(orcamentos)
            setChartData(dadosGrafico)

            if (showRefreshToast) {
                toast({
                    title: "Dashboard atualizado!",
                    description: "Dados foram atualizados com sucesso.",
                })
            }
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || error.message || "Erro ao carregar dashboard."
            setError(errorMessage)
            toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // Processar estatísticas
    const processarEstatisticas = (orcamentos: any[], clientes: any[]): DashboardStats => {
        const agora = new Date()
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
        const orcamentosMes = orcamentos.filter(o => new Date(o.dataEmissao) >= inicioMes)
        
        const totalOrcamentos = orcamentos.length
        const orcamentosAprovados = orcamentos.filter(o => o.status === 'aprovado').length
        const orcamentosRejeitados = orcamentos.filter(o => o.status === 'rejeitado').length
        const orcamentosPendentes = orcamentos.filter(o => ['rascunho', 'enviado'].includes(o.status)).length
        
        const valorTotalMes = orcamentosMes.reduce((sum, o) => sum + (o.valorTotal || 0), 0)
        const valorAprovadoMes = orcamentos
            .filter(o => o.status === 'aprovado' && new Date(o.dataEmissao) >= inicioMes)
            .reduce((sum, o) => sum + (o.valorTotal || 0), 0)
        const valorPendenteMes = orcamentos
            .filter(o => ['rascunho', 'enviado'].includes(o.status) && new Date(o.dataEmissao) >= inicioMes)
            .reduce((sum, o) => sum + (o.valorTotal || 0), 0)
        
        const taxaAprovacao = totalOrcamentos > 0 ? (orcamentosAprovados / totalOrcamentos) * 100 : 0
        const ticketMedio = totalOrcamentos > 0 ? valorTotalMes / orcamentosMes.length : 0
        
        // Simular crescimento do mês anterior (em produção, viria do backend)
        const crescimentoMes = Math.random() * 30 - 10 // -10% a +20%
        
        const metaMensal = 50000
        const progressoMeta = (valorAprovadoMes / metaMensal) * 100
        
        return {
            totalOrcamentos,
            orcamentosAprovados,
            orcamentosRejeitados,
            orcamentosPendentes,
            totalClientes: clientes.length,
            clientesAtivos: clientes.filter(c => c.status === 'ativo').length,
            valorTotalMes,
            valorAprovadoMes,
            valorPendenteMes,
            taxaAprovacao,
            ticketMedio,
            crescimentoMes,
            metaMensal,
            progressoMeta: Math.min(progressoMeta, 100)
        }
    }

    // Processar atividades recentes
    const processarAtividades = (orcamentos: any[], clientes: any[]): RecentActivity[] => {
        const atividades: RecentActivity[] = []
        
        // Últimos orçamentos criados
        orcamentos
            .sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime())
            .slice(0, 5)
            .forEach(o => {
                atividades.push({
                    id: o.id,
                    tipo: 'orcamento_criado',
                    titulo: `Orçamento #${o.numOrc} criado`,
                    descricao: `Para ${o.cliente?.nome || 'Cliente'}`,
                    data: o.dataEmissao,
                    valor: o.valorTotal,
                    cliente: o.cliente?.nome,
                    status: o.status
                })
            })
        
        // Últimos clientes cadastrados
        clientes
            .sort((a, b) => new Date(b.dataCadastro || b.createdAt).getTime() - new Date(a.dataCadastro || a.createdAt).getTime())
            .slice(0, 3)
            .forEach(c => {
                atividades.push({
                    id: c.id,
                    tipo: 'cliente_cadastrado',
                    titulo: 'Novo cliente cadastrado',
                    descricao: c.nome,
                    data: c.dataCadastro || c.createdAt,
                    cliente: c.nome
                })
            })
        
        return atividades
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 10)
    }

    // Processar top clientes
    const processarTopClientes = (orcamentos: any[], clientes: any[]): TopCliente[] => {
        const clientesMap = new Map()
        
        clientes.forEach(cliente => {
            clientesMap.set(cliente.id, {
                ...cliente,
                totalOrcamentos: 0,
                valorTotal: 0,
                ultimoOrcamento: null
            })
        })
        
        orcamentos.forEach(orcamento => {
            const clienteData = clientesMap.get(orcamento.clienteId)
            if (clienteData) {
                clienteData.totalOrcamentos++
                clienteData.valorTotal += orcamento.valorTotal || 0
                
                if (!clienteData.ultimoOrcamento || 
                    new Date(orcamento.dataEmissao) > new Date(clienteData.ultimoOrcamento)) {
                    clienteData.ultimoOrcamento = orcamento.dataEmissao
                }
            }
        })
        
        return Array.from(clientesMap.values())
            .filter(c => c.totalOrcamentos > 0)
            .sort((a, b) => b.valorTotal - a.valorTotal)
            .slice(0, 5)
    }

    // Processar dados do gráfico
    const processarDadosGrafico = (orcamentos: any[]): ChartData[] => {
        const meses = []
        const agora = new Date()
        
        for (let i = 5; i >= 0; i--) {
            const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
            const proximoMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1)
            
            const orcamentosMes = orcamentos.filter(o => {
                const dataOrcamento = new Date(o.dataEmissao)
                return dataOrcamento >= data && dataOrcamento < proximoMes
            })
            
            meses.push({
                mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
                orcamentos: orcamentosMes.length,
                valor: orcamentosMes.reduce((sum, o) => sum + (o.valorTotal || 0), 0),
                aprovados: orcamentosMes.filter(o => o.status === 'aprovado').length
            })
        }
        
        return meses
    }

    // Refresh manual
    const handleRefresh = () => {
        loadDashboardData(true)
    }

    // Navegação rápida
    const navegarPara = (rota: string) => {
        router.push(rota)
    }

    // Ícones para atividades
    const getActivityIcon = (tipo: string) => {
        switch (tipo) {
            case 'orcamento_criado':
                return <FileText className="h-4 w-4" />
            case 'orcamento_aprovado':
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case 'cliente_cadastrado':
                return <Users className="h-4 w-4 text-blue-600" />
            case 'orcamento_enviado':
                return <Send className="h-4 w-4 text-purple-600" />
            default:
                return <Activity className="h-4 w-4" />
        }
    }

    // Status badge para atividades
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            rascunho: { variant: "secondary" as const, label: "Rascunho", className: undefined },
            enviado: { variant: "default" as const, label: "Enviado", className: undefined },
            aprovado: { variant: "default" as const, label: "Aprovado", className: "bg-green-500" },
            rejeitado: { variant: "destructive" as const, label: "Rejeitado", className: undefined }
        }
        
        const config = statusConfig[status as keyof typeof statusConfig]
        if (!config) return null
        
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        )
    }

    // Efeitos
    useEffect(() => {
        if (token) {
            loadDashboardData()
        } else {
            router.push('/login')
        }
    }, [token, router])

    // Loading state
    if (loading) {
        return (
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Skeleton className="h-4 w-48" />
                </header>
                <div className="p-6">  {/*"p-4 md:p-6"*/}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                        
                        {/* Stats cards skeleton */}
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="pt-6">
                                        <Skeleton className="h-20 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        
                        {/* Content skeleton */}
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <Skeleton className="h-6 w-40" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-64 w-full" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-64 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        )
    }

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        disabled={refreshing}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                        <span className="hidden sm:inline">Atualizar</span>
                    </Button>
                    <Button onClick={() => navegarPara('/orcamentos')} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Novo Orçamento</span>
                    </Button>
                </div>
            </header>

            <div className="p-6"> {/*"p-4 md:p-6">*/}
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Visão geral do seu negócio - {formatDate(new Date().toISOString())}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navegarPara('/clientes')}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Clientes
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navegarPara('/orcamentos')}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Orçamentos
                        </Button>
                    </div>
                </div>

                {/* Cards de Estatísticas Principais */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Orçamentos Total</p>
                                    <p className="text-2xl font-bold">{stats.totalOrcamentos}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <span>{stats.orcamentosAprovados} aprovados</span>
                                        <span>•</span>
                                        <span>{stats.orcamentosPendentes} pendentes</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Valor Aprovado</p>
                                    <p className="text-xl lg:text-2xl font-bold text-green-600">
                                        {formatCurrency(stats.valorAprovadoMes)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {stats.crescimentoMes >= 0 ? (
                                            <TrendingUp className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-red-600" />
                                        )}
                                        <span className={cn(
                                            "text-xs font-medium",
                                            stats.crescimentoMes >= 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            {stats.crescimentoMes > 0 ? '+' : ''}{stats.crescimentoMes.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">vs mês anterior</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Taxa Aprovação</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {stats.taxaAprovacao.toFixed(1)}%
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <span>{stats.orcamentosAprovados} de {stats.totalOrcamentos}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Target className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                                    <p className="text-2xl font-bold">{stats.clientesAtivos}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <span>de {stats.totalClientes} cadastrados</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <Users className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Meta Mensal */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Meta Mensal</h3>
                                <p className="text-sm text-muted-foreground">
                                    {formatCurrency(stats.valorAprovadoMes)} de {formatCurrency(stats.metaMensal)}
                                </p>
                            </div>
                            <Badge variant={stats.progressoMeta >= 100 ? "default" : "secondary"} className="w-fit">
                                {stats.progressoMeta >= 100 ? (
                                    <>
                                        <Award className="h-3 w-3 mr-1" />
                                        Meta Atingida!
                                    </>
                                ) : (
                                    `${stats.progressoMeta.toFixed(1)}% da meta`
                                )}
                            </Badge>
                        </div>
                        <Progress value={stats.progressoMeta} className="w-full" />
                    </CardContent>
                </Card>

                {/* Abas principais */}
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
                        <TabsTrigger value="visao-geral" className="text-xs sm:text-sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Visão Geral</span>
                            <span className="sm:hidden">Geral</span>
                        </TabsTrigger>
                        <TabsTrigger value="atividades" className="text-xs sm:text-sm">
                            <Activity className="h-4 w-4 mr-2" />
                            Atividades
                        </TabsTrigger>
                        <TabsTrigger value="clientes" className="text-xs sm:text-sm">
                            <Users className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Top Clientes</span>
                            <span className="sm:hidden">Clientes</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="visao-geral" className="space-y-4">
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                            {/* Gráfico de Performance */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <CardTitle className="flex items-center gap-2">
                                            <LineChart className="h-5 w-5" />
                                            Performance dos Últimos 6 Meses
                                        </CardTitle>
                                        <div className="flex gap-2 text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span>Orçamentos</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span>Aprovados</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Simulação de gráfico com barras */}
                                        <div className="h-64 flex items-end justify-between gap-2 p-4 bg-muted/20 rounded-lg">
                                            {chartData.map((data, index) => {
                                                const maxOrcamentos = Math.max(...chartData.map(d => d.orcamentos))
                                                const heightPercentage = (data.orcamentos / maxOrcamentos) * 100
                                                const approvedPercentage = data.orcamentos > 0 ? (data.aprovados / data.orcamentos) * heightPercentage : 0
                                                
                                                return (
                                                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                                                        <div className="relative w-full max-w-12 h-48 bg-gray-200 rounded-sm overflow-hidden">
                                                            <div 
                                                                className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500"
                                                                style={{ height: `${heightPercentage}%` }}
                                                            />
                                                            <div 
                                                                className="absolute bottom-0 w-full bg-green-500 transition-all duration-500"
                                                                style={{ height: `${approvedPercentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs font-medium">{data.mes}</div>
                                                            <div className="text-xs text-muted-foreground">{data.orcamentos}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        
                                        {/* Resumo dos dados */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {chartData.reduce((sum, d) => sum + d.orcamentos, 0)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Total Orçamentos</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {chartData.reduce((sum, d) => sum + d.aprovados, 0)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Aprovados</p>
                                            </div>
                                            <div className="text-center col-span-2 sm:col-span-1">
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {formatCurrency(chartData.reduce((sum, d) => sum + d.valor, 0))}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Valor Total</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Resumo Rápido */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        Resumo Rápido
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Pendentes</p>
                                                <p className="text-xs text-muted-foreground">Precisam atenção</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{stats.orcamentosPendentes}</p>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => navegarPara('/orcamentos?status=enviado')}
                                            >
                                                <ArrowUpRight className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Ticket Médio</p>
                                                <p className="text-xs text-muted-foreground">Por orçamento</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                {formatCurrency(stats.ticketMedio)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Clock className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Em Análise</p>
                                                <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-purple-600">
                                                {formatCurrency(stats.valorPendenteMes)}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Ações Rápidas</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="justify-start h-9"
                                                onClick={() => navegarPara('/orcamentos')}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Novo Orçamento
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="justify-start h-9"
                                                onClick={() => navegarPara('/clientes')}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                Novo Cliente
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="justify-start h-9"
                                                onClick={() => navegarPara('/relatorios')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Relatórios
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="atividades" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Atividades Recentes
                                    </CardTitle>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ver Todas
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivities.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                            <p className="text-muted-foreground">Nenhuma atividade recente</p>
                                        </div>
                                    ) : (
                                        recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="p-2 bg-muted rounded-lg shrink-0">
                                                    {getActivityIcon(activity.tipo)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                        <div>
                                                            <p className="font-medium text-sm">{activity.titulo}</p>
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {activity.descricao}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {activity.valor && (
                                                                <span className="text-sm font-medium text-green-600">
                                                                    {formatCurrency(activity.valor)}
                                                                </span>
                                                            )}
                                                            {activity.status && getStatusBadge(activity.status)}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDateTime(activity.data)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="clientes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Top Clientes
                                    </CardTitle>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => navegarPara('/clientes')}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Ver Todos
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead className="hidden sm:table-cell">Orçamentos</TableHead>
                                                <TableHead>Valor Total</TableHead>
                                                <TableHead className="hidden md:table-cell">Último</TableHead>
                                                <TableHead className="w-10"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topClientes.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8">
                                                        <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                                        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                topClientes.map((cliente, index) => (
                                                    <TableRow key={cliente.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={cliente.avatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {cliente.nome.substring(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    {index === 0 && (
                                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                                                            <Star className="h-2 w-2 text-yellow-800" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">{cliente.nome}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {cliente.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <Badge variant="secondary">
                                                                {cliente.totalOrcamentos}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-mono font-medium text-green-600">
                                                                {formatCurrency(cliente.valorTotal)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(cliente.ultimoOrcamento)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="sm">
                                                                <ArrowUpRight className="h-3 w-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Cards de Ação Rápida - Apenas em telas maiores */}
                <div className="hidden lg:grid grid-cols-4 gap-4 mt-8">
                    <Card 
                        className="hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navegarPara('/orcamentos')}
                    >
                        <CardContent className="pt-6 text-center">
                            <div className="p-3 bg-blue-50 rounded-lg mx-auto w-fit mb-3 group-hover:bg-blue-100 transition-colors">
                                <Plus className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-medium">Criar Orçamento</h3>
                            <p className="text-sm text-muted-foreground">Novo orçamento para cliente</p>
                        </CardContent>
                    </Card>
                    
                    <Card 
                        className="hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navegarPara('/clientes')}
                    >
                        <CardContent className="pt-6 text-center">
                            <div className="p-3 bg-green-50 rounded-lg mx-auto w-fit mb-3 group-hover:bg-green-100 transition-colors">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-medium">Gerenciar Clientes</h3>
                            <p className="text-sm text-muted-foreground">Cadastrar e editar clientes</p>
                        </CardContent>
                    </Card>
                    
                    <Card 
                        className="hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navegarPara('/relatorios')}
                    >
                        <CardContent className="pt-6 text-center">
                            <div className="p-3 bg-purple-50 rounded-lg mx-auto w-fit mb-3 group-hover:bg-purple-100 transition-colors">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-medium">Relatórios</h3>
                            <p className="text-sm text-muted-foreground">Análises e exportações</p>
                        </CardContent>
                    </Card>
                    
                    <Card 
                        className="hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navegarPara('/usuarios')}
                    >
                        <CardContent className="pt-6 text-center">
                            <div className="p-3 bg-orange-50 rounded-lg mx-auto w-fit mb-3 group-hover:bg-orange-100 transition-colors">
                                <Building2 className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="font-medium">Configurações</h3>
                            <p className="text-sm text-muted-foreground">Perfil e preferências</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SidebarInset>
    )
}