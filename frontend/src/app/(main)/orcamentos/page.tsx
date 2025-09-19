"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"   
import { SidebarInset } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle,
    AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { 
    Plus, 
    Search, 
    Filter,
    MoreHorizontal,
    Edit, 
    Trash2,
    Eye,
    FileText,
    Users,
    Building2,
    Mail, 
    Phone,
    MapPin,
    Calendar,
    Check,
    AlertCircle,
    Loader2,
    Download,
    Upload,
    RefreshCw,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    Copy,
    Calculator,
    TrendingUp,
    Minus
} from "lucide-react"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { cn } from "@/lib/utils"
import { headers } from "next/headers"

interface Cliente {
    id: string
    nome: string
    email: string
    telefone?: string
    endereco?: string
    cidade?: string
    UF?: string
}

interface ItemOrcamento {
    id?: string
    quantidade: number
    descricao: string
    precoUnitario: number
    subtotal?: number
}

interface Orcamento {
    id: string
    numOrc: number
    dataEmissao: string
    dataVencimento?: string
    status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado' | 'cancelado'
    valorTotal: number
    cliente: Cliente
    itens: ItemOrcamento[]
    observacoes?: string
    dataEnvio?: string
    dataAprovacao?: string
    usuarioId: string
}

interface FormErrors {
    clienteId?: string
    itens?: string
    observacoes?: string
}

interface Filters {
    search: string
    status: string
    cliente: string
    dataInicio: string
    dataFim: string
    valorMin: string
    valorMax: string
}

export default function OrcamentosPage() {
    // Estados principais
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [filteredOrcamentos, setFilteredOrcamentos] = useState<Orcamento[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [isClient, setIsClient] = useState(false); // Novo estado para controle de hidratação
    const [atuStatus, setAtuStatus] = useState<Orcamento | null>(null)
    
    // Estados do modal/formulário
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null)
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
    const [itens, setItens] = useState<ItemOrcamento[]>([
        { quantidade: 1, descricao: "", precoUnitario: 0 }
    ])
    const [observacoes, setObservacoes] = useState<string>("")
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
    
    // Estados de validação e filtros
    const [errors, setErrors] = useState<FormErrors>({})
    const [filters, setFilters] = useState<Filters>({
        search: '',
        status: '',
        cliente: '',
        dataInicio: '',
        dataFim: '',
        valorMin: '',
        valorMax: ''
    })
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [currentTab, setCurrentTab] = useState("lista")
    
    // Estatísticas
    const [stats, setStats] = useState({
        total: 0,
        rascunhos: 0,
        enviados: 0,
        aprovados: 0,
        rejeitados: 0,
        valorTotalMes: 0,
        valorAprovadoMes: 0,
        taxaAprovacao: 0
    })
    
    const { toast } = useToast()

    // Validações
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        
        if (!selectedCliente) {
            newErrors.clienteId = 'Selecione um cliente'
        }
        
        if (itens.length === 0 || itens.every(item => !item.descricao.trim())) {
            newErrors.itens = 'Adicione pelo menos um item'
        }
        
        const hasInvalidItems = itens.some(item => 
            item.descricao.trim() && (item.quantidade <= 0 || item.precoUnitario <= 0)
        )
        
        if (hasInvalidItems) {
            newErrors.itens = 'Todos os itens devem ter quantidade e valor maiores que zero'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Formatação
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR')
    }

    const calcularTotal = (): number => {
        return itens.reduce((total, item) => {
            if (item.descricao.trim()) {
                return total + (item.quantidade * item.precoUnitario)
            }
            return total
        }, 0)
    }

    // Carregar dados
    const loadOrcamentos = async () => {
        try {
            setLoading(true)
            setError("")
            
            const token = localStorage.getItem("token")
            if (!token) {
                setError("Token de autenticação não encontrado.")
                return
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            const [orcamentosRes, clientesRes] = await Promise.all([
                axios.get(`${apiUrl}/Orcamento/listar`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${apiUrl}/Cliente/listar`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            if (orcamentosRes.data) {
                setOrcamentos(orcamentosRes.data)
                setFilteredOrcamentos(orcamentosRes.data)
                
                // Calcular estatísticas
                const stats = orcamentosRes.data.reduce((acc: any, orcamento: Orcamento) => {
                    acc.total++
                    acc[orcamento.status + 's']++
                    acc.valorTotalMes += orcamento.valorTotal
                    
                    if (orcamento.status === 'aprovado') {
                        acc.valorAprovadoMes += orcamento.valorTotal
                    }
                    
                    return acc
                }, {
                    total: 0,
                    rascunhos: 0,
                    enviados: 0,
                    aprovados: 0,
                    rejeitados: 0,
                    cancelados: 0,
                    valorTotalMes: 0,
                    valorAprovadoMes: 0
                })
                
                stats.taxaAprovacao = stats.total > 0 ? (stats.aprovados / stats.total) * 100 : 0
                setStats(stats)
            }
            
            if (clientesRes.data) {
                setClientes(clientesRes.data)
            }
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || error.message || "Erro ao carregar orçamentos."
            setError(errorMessage)
            toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    // Filtrar orçamentos
    const filterOrcamentos = useCallback(() => {
        let filtered = orcamentos

        if (filters.search) {
            const search = filters.search.toLowerCase()
            filtered = filtered.filter(orcamento => 
                orcamento.numOrc.toString().includes(search) ||
                orcamento.cliente.nome.toLowerCase().includes(search) ||
                orcamento.cliente.email?.toLowerCase().includes(search)
            )
        }

        if (filters.status) {
            filtered = filtered.filter(orcamento => orcamento.status === filters.status)
        }

        if (filters.cliente) {
            filtered = filtered.filter(orcamento => 
                orcamento.cliente.nome.toLowerCase().includes(filters.cliente.toLowerCase())
            )
        }

        if (filters.dataInicio) {
            filtered = filtered.filter(orcamento => 
                new Date(orcamento.dataEmissao) >= new Date(filters.dataInicio)
            )
        }

        if (filters.dataFim) {
            filtered = filtered.filter(orcamento => 
                new Date(orcamento.dataEmissao) <= new Date(filters.dataFim)
            )
        }

        if (filters.valorMin) {
            filtered = filtered.filter(orcamento => 
                orcamento.valorTotal >= parseFloat(filters.valorMin)
            )
        }

        if (filters.valorMax) {
            filtered = filtered.filter(orcamento => 
                orcamento.valorTotal <= parseFloat(filters.valorMax)
            )
        }

        setFilteredOrcamentos(filtered)
    }, [orcamentos, filters])

    // Manipular itens
    const handleItemChange = (index: number, field: keyof ItemOrcamento, value: string | number) => {
        const newItens = [...itens]
        if (field === 'quantidade' || field === 'precoUnitario') {
            newItens[index][field] = Number(value)
        } else if (field === 'descricao') {
            newItens[index][field] = value as string
        }
        setItens(newItens)
        setHasUnsavedChanges(true)
    }

    const adicionarItem = () => {
        setItens([...itens, { quantidade: 1, descricao: "", precoUnitario: 0 }])
        setHasUnsavedChanges(true)
    }

    const removerItem = (index: number) => {
        if (itens.length > 1) {
            setItens(itens.filter((_, i) => i !== index))
            setHasUnsavedChanges(true)
        }
    }

    // Salvar orçamento
    const handleSave = async (status: 'rascunho' | 'enviado' = 'rascunho') => {
        if (!validateForm()) {
            toast({
                title: "Erro de validação",
                description: "Por favor, corrija os campos destacados",
                variant: "destructive"
            })
            return
        }

        try {
            setSaving(true)
            setUploadProgress(0)
            
            const token = localStorage.getItem("token")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

            const payload = {
                clienteId: selectedCliente!.id,
                itens: itens.filter(item => item.descricao.trim()),
                observacoes,
                status,
                dataEmissao: new Date().toISOString()
            }

            setUploadProgress(50)

            if (editingOrcamento) {
                await axios.put(`${apiUrl}/Orcamento/${editingOrcamento.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast({
                    title: "Sucesso!",
                    description: "Orçamento atualizado com sucesso",
                })
            } else {
                await axios.post(`${apiUrl}/Orcamento/criar`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast({
                    title: "Sucesso!",
                    description: `Orçamento ${status === 'rascunho' ? 'salvo como rascunho' : 'criado e enviado'}`,
                })
            }

            setUploadProgress(100)
            await loadOrcamentos()
            handleCloseDialog()

        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || "Erro ao salvar orçamento"
            toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setSaving(false)
            setUploadProgress(0)
        }
    }

    // Alterar status do orçamento
    const handleStatusChange = async (orcamentoId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem("token")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            
            await axios.put(`${apiUrl}/Orcamento/status/${orcamentoId}`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            toast({
                title: "Status atualizado!",
                description: `Orçamento marcado como ${newStatus}`,
            })
            
            await loadOrcamentos()
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || "Erro ao atualizar status"
            console.log(orcamentoId)
            toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    // Download PDF
    const handleDownloadPDF = async (orcamentoId: string, numOrc: number) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                toast({
                    title: "Erro de autenticação",
                    description: "Token não encontrado. Faça login novamente.",
                    variant: "destructive"
                })
                return
            }
    
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            
            // Usar fetch ao invés de window.open para incluir o token
            const response = await fetch(`${apiUrl}/Orcamento/pdf/${orcamentoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
    
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.erro || 'Erro ao gerar PDF')
            }
    
            // Converter a resposta em blob
            const blob = await response.blob()
            
            // Criar URL do blob e fazer download
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `orcamento_${numOrc}.pdf`
            link.style.display = 'none'
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            // Limpar URL do blob
            window.URL.revokeObjectURL(url)
            
            toast({
                title: "PDF gerado!",
                description: `Orçamento #${numOrc} baixado com sucesso`,
            })
            
        } catch (error: any) {
            console.error('Erro ao baixar PDF:', error)
            toast({
                title: "Erro",
                description: error.message || "Erro ao gerar PDF",
                variant: "destructive"
            })
        }
    }
    /*
    const handleDownloadPDF = async (orcamentoId: string, numOrc: number) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            window.open(`${apiUrl}/Orcamento/pdf/${orcamentoId}`, "_blank")
            
            toast({
                title: "PDF gerado!",
                description: `Orçamento #${numOrc} baixado com sucesso`,
            })
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao gerar PDF",
                variant: "destructive"
            })
        }
    }
    */
    // Duplicar orçamento
    const handleDuplicate = (orcamento: Orcamento) => {
        setEditingOrcamento(null)
        setSelectedCliente(orcamento.cliente)
        setItens(orcamento.itens.map(item => ({
            quantidade: item.quantidade,
            descricao: item.descricao,
            precoUnitario: item.precoUnitario
        })))
        setObservacoes(orcamento.observacoes || "")
        setErrors({})
        setHasUnsavedChanges(true)
        setIsDialogOpen(true)
    }

    // Modal handlers
    const handleNewOrcamento = () => {
        setEditingOrcamento(null)
        setSelectedCliente(null)
        setItens([{ quantidade: 1, descricao: "", precoUnitario: 0 }])
        setObservacoes("")
        setErrors({})
        setHasUnsavedChanges(false)
        setIsDialogOpen(true)
    }

    const handleEditOrcamento = (orcamento: Orcamento) => {
        setEditingOrcamento(orcamento)
        setSelectedCliente(orcamento.cliente)
        setItens(orcamento.itens)
        setObservacoes(orcamento.observacoes || "")
        setErrors({})
        setHasUnsavedChanges(false)
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingOrcamento(null)
        setSelectedCliente(null)
        setItens([{ quantidade: 1, descricao: "", precoUnitario: 0 }])
        setObservacoes("")
        setErrors({})
        setHasUnsavedChanges(false)
    }

    // Status badge e ícones
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            rascunho: { 
                variant: "secondary" as const, 
                label: "Pendente",
                icon: Edit,
                className: ""
            },
            enviado: { 
                variant: "default" as const, 
                label: "Enviado",
                icon: Send,
                className: ""
            },
            aprovado: { 
                variant: "default" as const, 
                label: "Aprovado",
                icon: CheckCircle,
                className: "bg-green-500 hover:bg-green-600"
            },
            rejeitado: { 
                variant: "destructive" as const, 
                label: "Rejeitado",
                icon: XCircle,
                className: ""
            },
            cancelado: { 
                variant: "secondary" as const, 
                label: "Cancelado",
                icon: Minus,
                className: ""
            }
        }
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.rascunho
        const Icon = config.icon
        
        return (
            <Badge 
                variant={config.variant} 
                className={cn("flex items-center gap-1", config.className)}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        )
    }

    // Efeitos
    useEffect(() => {
        setIsClient(true); // Indica que o componente foi montado no cliente
        loadOrcamentos()
    }, [])

    useEffect(() => {
        filterOrcamentos()
    }, [filterOrcamentos])

    if (loading) {
        return (
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Skeleton className="h-4 w-48" />
                </header>
                <div className="p-6">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-64" />
                        <div className="grid gap-4 md:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="pt-6">
                                        <Skeleton className="h-16 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
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
            </SidebarInset>
        )
    }

    if (!isClient) {
        return null; // Não renderiza nada no servidor ou antes da hidratação no cliente
    }

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Orçamentos</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={loadOrcamentos}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Atualizar
                    </Button>
                    <Button onClick={handleNewOrcamento} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Orçamento
                    </Button>
                </div>
            </header>

            <div className="p-6">
                {saving && uploadProgress > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">Processando...</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                    </div>
                )}

                {/* Estatísticas */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-sm text-muted-foreground">Total de Orçamentos</p>
                                </div>
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{stats.aprovados}</p>
                                    <p className="text-sm text-muted-foreground">Aprovados</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(stats.valorTotalMes)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Valor Total</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {stats.taxaAprovacao.toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-muted-foreground">Taxa Aprovação</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Abas principais */}
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="lista">Lista de Orçamentos</TabsTrigger>
                        <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
                        <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                    </TabsList>

                    <TabsContent value="lista" className="space-y-4">
                        {/* Filtros */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filtros
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                                    <div className="space-y-2">
                                        <Label>Buscar</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Número ou cliente..."
                                                value={filters.search}
                                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select 
                                            value={filters.status} 
                                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rascunho">Rascunho</SelectItem>
                                                <SelectItem value="enviado">Enviado</SelectItem>
                                                <SelectItem value="aprovado">Aprovado</SelectItem>
                                                <SelectItem value="rejeitado">Rejeitado</SelectItem>
                                                <SelectItem value="cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Cliente</Label>
                                        <Input
                                            placeholder="Nome do cliente..."
                                            value={filters.cliente}
                                            onChange={(e) => setFilters(prev => ({ ...prev, cliente: e.target.value }))}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Data Inicial</Label>
                                        <Input
                                            type="date"
                                            value={filters.dataInicio}
                                            onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Data Final</Label>
                                        <Input
                                            type="date"
                                            value={filters.dataFim}
                                            onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Valor Mín.</Label>
                                        <Input
                                            type="number"
                                            placeholder="R$ 0,00"
                                            value={filters.valorMin}
                                            onChange={(e) => setFilters(prev => ({ ...prev, valorMin: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                
                                {(Object.values(filters).some(filter => filter !== '')) && (
                                    <div className="mt-4 flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setFilters({
                                                search: '', status: '', cliente: '',
                                                dataInicio: '', dataFim: '', valorMin: '', valorMax: ''
                                            })}
                                        >
                                            Limpar Filtros
                                        </Button>
                                        <Badge variant="secondary">
                                            {filteredOrcamentos.length} orçamento(s) encontrado(s)
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Lista de Orçamentos */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Lista de Orçamentos ({filteredOrcamentos.length})
                                    </CardTitle>
                                    
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Exportar
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Importar
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Orçamento</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Itens</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrcamentos.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                                                            <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
                                                            <Button variant="outline" onClick={handleNewOrcamento}>
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Criar Primeiro Orçamento
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredOrcamentos.map((orcamento) => (
                                                    <TableRow key={orcamento.id}>
                                                        <TableCell>
                                                            <div className="font-medium">#{orcamento.numOrc}</div>
                                                           {/* <div className="text-sm text-muted-foreground">
                                                                ID: {orcamento.id.slice(0, 8)}...
                                                            </div> */}
                                                        </TableCell>
                                                        
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{orcamento.cliente?.nome}</p>
                                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                    <Mail className="h-3 w-3" />
                                                                    {orcamento.cliente?.email}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        
                                                        <TableCell>
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(orcamento.dataEmissao)}
                                                            </div>
                                                        </TableCell>
                                                        
                                                        <TableCell>
                                                            {getStatusBadge(orcamento.status)}
                                                        </TableCell>
                                                        
                                                        <TableCell className="font-mono font-medium">
                                                            {formatCurrency(orcamento.valorTotal)}
                                                        </TableCell>
                                                        
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {orcamento.itens?.length || 0} item(s)
                                                            </Badge>
                                                        </TableCell>
                                                        
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                    
                                                                    <DropdownMenuItem onClick={() => handleEditOrcamento(orcamento)}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Editar
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuItem onClick={() => handleDuplicate(orcamento)}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Duplicar
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDownloadPDF(orcamento.id, orcamento.numOrc)}
                                                                    >
                                                                        <Download className="h-4 w-4 mr-2" />
                                                                        Baixar PDF
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuSeparator />
                                                                    
                                                                    <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                                                                    
                                                                    {orcamento.status !== 'enviado' && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(orcamento.id, 'enviado')}
                                                                        >
                                                                            <Send className="h-4 w-4 mr-2" />
                                                                            Enviar
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    
                                                                    {orcamento.status !== 'aprovado' && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(orcamento.id, 'aprovado')}
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            Aprovar
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    
                                                                    {orcamento.status !== 'rejeitado' && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(orcamento.id, 'rejeitado')}
                                                                        >
                                                                            <XCircle className="h-4 w-4 mr-2" />
                                                                            Rejeitar
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    
                                                                    <DropdownMenuSeparator />
                                                                    
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <DropdownMenuItem 
                                                                                onSelect={(e) => e.preventDefault()}
                                                                                className="text-destructive"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                Excluir
                                                                            </DropdownMenuItem>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Tem certeza que deseja excluir o orçamento #{orcamento.numOrc}? 
                                                                                    Esta ação não pode ser desfeita.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                                <AlertDialogAction 
                                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                                >
                                                                                    Excluir
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
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

                    <TabsContent value="estatisticas">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Orçamentos por Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <Edit className="h-4 w-4" />
                                                Rascunhos
                                            </span>
                                            <Badge variant="secondary">{stats.rascunhos}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <Send className="h-4 w-4" />
                                                Enviados
                                            </span>
                                            <Badge>{stats.enviados}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                Aprovados
                                            </span>
                                            <Badge className="bg-green-500 hover:bg-green-600">{stats.aprovados}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                                Rejeitados
                                            </span>
                                            <Badge variant="destructive">{stats.rejeitados}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumo Financeiro</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-blue-600" />
                                                Valor Total
                                            </span>
                                            <span className="font-mono font-bold">
                                                {formatCurrency(stats.valorTotalMes)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                Valor Aprovado
                                            </span>
                                            <span className="font-mono font-bold text-green-600">
                                                {formatCurrency(stats.valorAprovadoMes)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                                Taxa de Aprovação
                                            </span>
                                            <span className="font-mono font-bold text-purple-600">
                                                {stats.taxaAprovacao.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded border">
                                            <span className="flex items-center gap-2">
                                                <Calculator className="h-4 w-4 text-orange-600" />
                                                Ticket Médio
                                            </span>
                                            <span className="font-mono font-bold text-orange-600">
                                                {formatCurrency(stats.total > 0 ? stats.valorTotalMes / stats.total : 0)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="relatorios">
                        <Card>
                            <CardHeader>
                                <CardTitle>Relatórios e Exportação</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                                        <Download className="h-6 w-6" />
                                        <span>Relatório Completo</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                                        <FileText className="h-6 w-6" />
                                        <span>Orçamentos por Período</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                                        <Users className="h-6 w-6" />
                                        <span>Relatório por Cliente</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                                        <TrendingUp className="h-6 w-6" />
                                        <span>Análise de Performance</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                                        <DollarSign className="h-6 w-6" />
                                        <span>Relatório Financeiro</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                                        <Calendar className="h-6 w-6" />
                                        <span>Acompanhamento Mensal</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Criação/Edição */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingOrcamento 
                                ? `Editando orçamento #${editingOrcamento.numOrc}`
                                : 'Crie um novo orçamento preenchendo as informações abaixo.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {saving && uploadProgress > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm font-medium">
                                    {editingOrcamento ? 'Atualizando orçamento...' : 'Criando orçamento...'}
                                </span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Seleção de Cliente */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Cliente
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Selecionar Cliente *</Label>
                                    <Select 
                                        value={selectedCliente?.id || ""} 
                                        onValueChange={(clienteId) => {
                                            const cliente = clientes.find(c => c.id === clienteId)
                                            setSelectedCliente(cliente || null)
                                            setHasUnsavedChanges(true)
                                        }}
                                    >
                                        <SelectTrigger className={cn(
                                            errors.clienteId && "border-destructive"
                                        )}>
                                            <SelectValue placeholder="Selecione o cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clientes.map((cliente) => (
                                                <SelectItem key={cliente.id} value={cliente.id}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{cliente.nome}</span>
                                                        <span className="text-xs text-muted-foreground">{cliente.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.clienteId && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.clienteId}
                                        </p>
                                    )}
                                </div>

                                {selectedCliente && (
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <div className="grid gap-2 md:grid-cols-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="h-4 w-4" />
                                                    <strong>Cliente:</strong> {selectedCliente.nome}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4" />
                                                    <strong>Email:</strong> {selectedCliente.email}
                                                </div>
                                                {selectedCliente.telefone && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4" />
                                                        <strong>Telefone:</strong> {selectedCliente.telefone}
                                                    </div>
                                                )}
                                                {selectedCliente.cidade && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-4 w-4" />
                                                        <strong>Cidade:</strong> {selectedCliente.cidade}, {selectedCliente.UF}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Itens do Orçamento */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Itens do Orçamento
                            </h3>
                            
                            <div className="space-y-4">
                                {itens.map((item, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="grid gap-4 md:grid-cols-12 items-end">
                                            <div className="md:col-span-1">
                                                <Label className="text-xs">Qtd.</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantidade}
                                                    onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-6">
                                                <Label className="text-xs">Descrição</Label>
                                                <Input
                                                    value={item.descricao}
                                                    onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                                                    placeholder="Descrição do item..."
                                                    className="h-9"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-2">
                                                <Label className="text-xs">Valor Unit.</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.precoUnitario}
                                                    onChange={(e) => handleItemChange(index, "precoUnitario", e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-2">
                                                <Label className="text-xs">Subtotal</Label>
                                                <Input
                                                    disabled
                                                    value={formatCurrency(item.quantidade * item.precoUnitario)}
                                                    className="h-9 bg-muted"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => removerItem(index)}
                                                    disabled={itens.length === 1}
                                                    className="h-9 w-9 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                
                                {errors.itens && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.itens}
                                    </p>
                                )}
                                
                                <div className="flex justify-between items-center">
                                    <Button onClick={adicionarItem} variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar Item
                                    </Button>
                                    
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total do Orçamento</p>
                                        <p className="text-2xl font-bold">{formatCurrency(calcularTotal())}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Observações */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Observações
                            </h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações adicionais</Label>
                                <Textarea
                                    id="observacoes"
                                    value={observacoes}
                                    onChange={(e) => {
                                        setObservacoes(e.target.value)
                                        setHasUnsavedChanges(true)
                                    }}
                                    placeholder="Condições de pagamento, prazos de entrega, observações gerais..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Ações do Modal */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                                <span>Campos marcados com * são obrigatórios</span>
                            </div>
                            
                            <div className="flex gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" disabled={saving}>
                                            Cancelar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {hasUnsavedChanges 
                                                    ? "Você tem alterações não salvas. Todas as modificações serão perdidas."
                                                    : "Tem certeza que deseja fechar este formulário?"
                                                }
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={handleCloseDialog}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {hasUnsavedChanges ? "Descartar alterações" : "Fechar"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                
                                <Button 
                                    onClick={() => handleSave('rascunho')}
                                    variant="outline"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Salvar Rascunho
                                        </>
                                    )}
                                </Button>
                                
                                <Button 
                                    onClick={() => handleSave('enviado')}
                                    disabled={saving || Object.keys(errors).length > 0}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            {editingOrcamento ? 'Atualizar e Enviar' : 'Criar e Enviar'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    )
}