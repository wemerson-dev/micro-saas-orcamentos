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
    DialogTrigger,
} from "@/components/ui/dialog"

import { 
    Plus, 
    Search, 
    Filter,
    MoreHorizontal,
    Edit, 
    Trash2,
    Eye,
    Users,
    Building2,
    Mail, 
    Phone,
    MapPin,
    Calendar,
    FileText,
    Check,
    AlertCircle,
    Loader2,
    Download,
    Upload,
    RefreshCw
} from "lucide-react"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { cn } from "@/lib/utils"

interface Cliente {
    id: string
    nome: string
    email: string
    telefone: string
    endereco: string
    bairro: string
    numero: string
    cidade: string
    cgc?: string
    usuarioId: string
    CEP?: string
    UF?: string
    observacoes?: string
    status: 'ativo' | 'inativo' | 'bloqueado'
    dataCadastro: string
    //ultimoContato?: string
    //totalOrcamentos?: number
}

interface FormErrors {
    nome?: string
    email?: string
    telefone?: string
    endereco?: string
    bairro?: string
    cidade?: string
    CEP?: string
    UF?: string
    numero?: string
    cgc?: string
    observacoes?: string
}

interface Filters {
    search: string
    status: string
    cidade: string
}

export default function ClientesPage() {
    // Estados principais
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    
    // Estados do modal/formulário
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [editingClient, setEditingClient] = useState<Cliente | null>(null)
    const [formData, setFormData] = useState<Partial<Cliente>>({
        status: 'ativo'
    })
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
    
    // Estados de validação e filtros
    const [errors, setErrors] = useState<FormErrors>({})
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
    const [filters, setFilters] = useState<Filters>({
        search: '',
        status: '',
        cidade: ''
    })
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    
    // Estatísticas
    const [stats, setStats] = useState({
        total: 0,
        ativos: 0,
        inativos: 0,
        bloqueados: 0
    })
    
    const { toast } = useToast()

    // Validação em tempo real
    const validateField = useCallback((name: string, value: string): string => {
        switch (name) {
            case 'nome':
                if (!value.trim()) return 'Nome é obrigatório'
                if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres'
                return ''
            case 'email':
                if (!value.trim()) return 'Email é obrigatório'
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido'
                return ''
            case 'telefone':
                if (!value.trim()) return 'Telefone é obrigatório'
                if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) return 'Formato: (11) 99999-9999'
                return ''
            case 'CEP':
                if (!value.trim()) return 'CEP é obrigatório'
                if (!/^\d{5}-?\d{3}$/.test(value)) return 'Formato: 12345-678'
                return ''
            case 'endereco':
                if (!value.trim()) return 'Endereço é obrigatório'
                return ''
            case 'bairro':
                if (!value.trim()) return 'Bairro é obrigatório'
                return ''
            case 'cidade':
                if (!value.trim()) return 'Cidade é obrigatória'
                return ''
            case 'UF':
                if (!value.trim()) return 'UF é obrigatório'
                if (value.length !== 2) return 'UF deve ter 2 caracteres'
                return ''
            case 'numero':
                if (!value.trim()) return 'Número é obrigatório'
                return ''
            default:
                return ''
        }
    }, [])

    // Formatação
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
        }
        return value
    }

    const formatCEP = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR')
    }

    // Carregar clientes
    const loadClientes = async () => {
        try {
            setLoading(true)
            setError("")
            
            const token = localStorage.getItem("token")
            if (!token) {
                setError("Token de autenticação não encontrado.")
                return
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            const response = await axios.get(`${apiUrl}/cliente/listar`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data) {
                setClientes(response.data)
                setFilteredClientes(response.data)
                
                // Calcular estatísticas
                const stats = response.data.reduce((acc: any, cliente: Cliente) => {
                    acc.total++
                    if (cliente.status === 'ativo') acc.ativos++
                    if (cliente.status === 'inativo') acc.inativos++
                    if (cliente.status === 'bloqueado') acc.bloqueados++
                    return acc
                }, { total: 0, ativos: 0, inativos: 0, bloqueados: 0 })
                
                setStats(stats)
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || error.message || "Erro ao carregar clientes."
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

    // Filtrar clientes
    const filterClientes = useCallback(() => {
        let filtered = clientes

        if (filters.search) {
            const search = filters.search.toLowerCase()
            filtered = filtered.filter(cliente => 
                cliente.nome.toLowerCase().includes(search) ||
                cliente.email.toLowerCase().includes(search) ||
                cliente.telefone.includes(search)
            )
        }

        if (filters.status === 'all') {
            // Se o status for 'all', não aplicar filtro de status
        } else if (filters.status) {
            filtered = filtered.filter(cliente => cliente.status === filters.status)
        }

        if (filters.cidade) {
            filtered = filtered.filter(cliente => 
                cliente.cidade.toLowerCase().includes(filters.cidade.toLowerCase())
            )
        }

        setFilteredClientes(filtered)
    }, [clientes, filters])

    // Handler para mudanças nos inputs
    const handleInputChange = (name: string, value: string) => {
        console.log('🔄 Input mudou:', { name, value, antes: formData[name as keyof Cliente] })
        setFormData(prev => {
            const newData = { ...prev, [name]: value }
            console.log('📝 FormData atualizado:', newData)
            return newData
        })
        setHasUnsavedChanges(true)
        
        const erro = validateField(name, value)
        console.log('✅ Validação:', { field: name, value, error })
        
        setErrors(prev => ({ 
            ...prev, 
            [name]: erro || undefined
        }))

        if (!error && errors[name as keyof FormErrors]) {
            const newErrors = { ...errors }
            delete newErrors[name as keyof FormErrors]
            setErrors(newErrors)
        }
        
        /*if (touchedFields.has(name)) {const error = validateField(name, value)
            const error = validateField(name, value)
            setErrors(prev => ({ ...prev, [name]: error || undefined }))
        }*/
    }

    const isFormValid = (): boolean => {
        const requiredFields = ['nome', 'email', 'telefone', 'endereco', 'bairro', 'cidade', 'CEP', 'UF', 'numero']
        
        // ✅ Verificar se todos os campos obrigatórios estão preenchidos
        const allFieldsFilled = requiredFields.every(field => {
            const value = formData[field as keyof Cliente] as string || ''
            return value.trim() !== ''
        })
        
        // ✅ Verificar se não há erros
        const noErrors = Object.keys(errors).length === 0
        
        return allFieldsFilled && noErrors
    }

    const handleFieldBlur = (name: string) => { 
        setTouchedFields(prev => new Set(prev).add(name))
        if (formData[name as keyof Cliente]) {
            const error = validateField(name, formData[name as keyof Cliente] as string)
            setErrors(prev => ({ ...prev, [name]: error || undefined }))
        }
    }

    // Validar formulário
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        const fields = ['nome', 'email', 'telefone', 'endereco', 'bairro', 'cidade', 'cgc','CEP', 'UF', 'numero','observacoes']
        
        fields.forEach(field => {
            const value = formData[field as keyof Cliente] as string || ''
            const error = validateField(field, value)
            if (error) newErrors[field as keyof FormErrors] = error
        })
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Salvar cliente
    const handleSave = async () => {
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

            setUploadProgress(50)

            if (editingClient) {
                // Editar cliente existente
                await axios.put(`${apiUrl}/cliente/atualizar/${editingClient.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast({
                    title: "Sucesso!",
                    description: "Cliente atualizado com sucesso",
                })
            } else {
                // Criar novo cliente
                await axios.post(`${apiUrl}/cliente/criar`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast({
                    title: "Sucesso!",
                    description: "Cliente cadastrado com sucesso",
                })
            }

            setUploadProgress(100)
            
            // Recarregar lista
            await loadClientes()
            
            // Resetar formulário
            handleCloseDialog()

        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || "Erro ao salvar cliente"
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

    // Deletar cliente
    const handleDelete = async (clienteId: string) => {
        try {
            const token = localStorage.getItem("token")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            
            await axios.delete(`${apiUrl}/cliente/deletar/${clienteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            toast({
                title: "Sucesso!",
                description: "Cliente removido com sucesso",
            })
            
            await loadClientes()
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || "Erro ao remover cliente"
            toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    // Abrir modal para novo cliente
    const handleNewClient = () => {
        setEditingClient(null)
        setFormData({ status: 'ativo' })
        setErrors({})
        setTouchedFields(new Set())
        setHasUnsavedChanges(false)
        setIsDialogOpen(true)
    }

    // Abrir modal para editar cliente
    const handleEditClient = (cliente: Cliente) => {
        setEditingClient(cliente)
        setFormData(cliente)
        setErrors({})
        setTouchedFields(new Set())
        setHasUnsavedChanges(false)
        setIsDialogOpen(true)
    }

    // Fechar modal
    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingClient(null)
        setFormData({ status: 'ativo' })
        setErrors({})
        setTouchedFields(new Set())
        setHasUnsavedChanges(false)
    }

    // Status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            ativo: { variant: "default" as const, label: "Ativo" },
            inativo: { variant: "secondary" as const, label: "Inativo" },
            bloqueado: { variant: "destructive" as const, label: "Bloqueado" }
        }
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    // Efeitos
    useEffect(() => {
        loadClientes()
    }, [])

    useEffect(() => {
        filterClientes()
    }, [filterClientes])

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
                                <BreadcrumbPage>Clientes</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={loadClientes}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Atualizar
                    </Button>
                    <Button onClick={handleNewClient} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Cliente
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
                                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
                                    <p className="text-sm text-muted-foreground">Ativos</p>
                                </div>
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">{stats.inativos}</p>
                                    <p className="text-sm text-muted-foreground">Inativos</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{stats.bloqueados}</p>
                                    <p className="text-sm text-muted-foreground">Bloqueados</p>
                                </div>
                                <Building2 className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Buscar</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Nome, email ou telefone..."
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
                                        <SelectValue placeholder="Todos os status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="ativo">Ativo</SelectItem>
                                        <SelectItem value="inativo">Inativo</SelectItem>
                                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Cidade</Label>
                                <Input
                                    placeholder="Filtrar por cidade..."
                                    value={filters.cidade}
                                    onChange={(e) => setFilters(prev => ({ ...prev, cidade: e.target.value }))}
                                />
                            </div>
                        </div>
                        
                        {(filters.search || filters.status || filters.cidade) && (
                            <div className="mt-4">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setFilters({ search: '', status: '', cidade: '' })}
                                >
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Lista de Clientes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Lista de Clientes ({filteredClientes.length})
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
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Contato</TableHead>
                                        <TableHead>Localização</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Data Cadastro</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClientes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Users className="h-12 w-12 text-muted-foreground/50" />
                                                    <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                                                    <Button variant="outline" onClick={handleNewClient}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Cadastrar Primeiro Cliente
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClientes.map((cliente) => (
                                            <TableRow key={cliente.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{cliente.nome}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {/*{cliente.totalOrcamentos || 0} orçamentos*/}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Mail className="h-3 w-3" />
                                                            {cliente.email}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Phone className="h-3 w-3" />
                                                            {cliente.telefone}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="h-3 w-3" />
                                                        {cliente.cidade}, {cliente.UF}
                                                    </div>
                                                </TableCell>
                                                
                                                <TableCell>
                                                    {getStatusBadge(cliente.status)}
                                                </TableCell>
                                                
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(cliente.dataCadastro)}
                                                    </div>
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
                                                            <DropdownMenuItem onClick={() => handleEditClient(cliente)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Visualizar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Orçamentos
                                                            </DropdownMenuItem>
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
                                                                            Tem certeza que deseja excluir o cliente "{cliente.nome}"? 
                                                                            Esta ação não pode ser desfeita.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDelete(cliente.id)}
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
            </div>

            {/* Modal/Dialog para Cadastro/Edição */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingClient 
                                ? 'Atualize as informações do cliente abaixo.'
                                : 'Preencha as informações do novo cliente abaixo.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {saving && uploadProgress > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm font-medium">
                                    {editingClient ? 'Atualizando cliente...' : 'Cadastrando cliente...'}
                                </span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Informações Básicas */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Informações Básicas
                            </h3>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome/Empresa *</Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome || ""}
                                        onChange={(e) => handleInputChange('nome', e.target.value)}
                                        onBlur={() => handleFieldBlur('nome')}
                                        className={cn(
                                            errors.nome && touchedFields.has('nome') && "border-destructive"
                                        )}
                                        placeholder="Digite o nome do cliente"
                                    />
                                    {errors.nome && touchedFields.has('nome') && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.nome}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={formData.status || 'ativo'} 
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="bloqueado">Bloqueado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        onBlur={() => handleFieldBlur('email')}
                                        className={cn(
                                            errors.email && touchedFields.has('email') && "border-destructive"
                                        )}
                                        placeholder="cliente@email.com"
                                    />
                                    {errors.email && touchedFields.has('email') && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone *</Label>
                                    <Input
                                        id="telefone"
                                        value={formData.telefone || ""}
                                        onChange={(e) => {
                                            const formatted = formatPhone(e.target.value)
                                            handleInputChange('telefone', formatted)
                                        }}
                                        onBlur={() => handleFieldBlur('telefone')}
                                        className={cn(
                                            errors.telefone && touchedFields.has('telefone') && "border-destructive"
                                        )}
                                        placeholder="(11) 99999-9999"
                                    />
                                    {errors.telefone && touchedFields.has('telefone') && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.telefone}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cgc">CPF/CNPJ *</Label>
                                    <Input
                                        id="cgc"
                                        value={formData.cgc || ""}
                                        onChange={(e) => handleInputChange('cgc', e.target.value)}
                                        onBlur={() => handleFieldBlur('cgc')}
                                        className={cn(
                                            errors.cgc && "border-destructive"
                                        )}
                                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                    />
                                    {errors.cgc && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.cgc}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Endereço */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Endereço
                            </h3>
                            
                            <div className="grid gap-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="endereco">Endereço *</Label>
                                        <Input
                                            id="endereco"
                                            value={formData.endereco || ""}
                                            onChange={(e) => handleInputChange('endereco', e.target.value)}
                                            onBlur={() => handleFieldBlur('endereco')}
                                            className={cn(
                                                errors.endereco && touchedFields.has('endereco') && "border-destructive"
                                            )}
                                            placeholder="Rua, Avenida, etc."
                                        />
                                        {errors.endereco && touchedFields.has('endereco') && (
                                            <p className="text-xs text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.endereco}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="numero">Número *</Label>
                                        <Input
                                            id="numero"
                                            value={formData.numero || ""}
                                            onChange={(e) => handleInputChange('numero', e.target.value)}
                                            onBlur={() => handleFieldBlur('numero')}
                                            className={cn(
                                                errors.numero && touchedFields.has('numero') && "border-destructive"
                                            )}
                                            placeholder="123"
                                        />
                                        {errors.numero && touchedFields.has('numero') && (
                                            <p className="text-xs text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.numero}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="bairro">Bairro *</Label>
                                        <Input
                                            id="bairro"
                                            value={formData.bairro || ""}
                                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                                            onBlur={() => handleFieldBlur('bairro')}
                                            className={cn(
                                                errors.bairro && touchedFields.has('bairro') && "border-destructive"
                                            )}
                                            placeholder="Nome do bairro"
                                        />
                                        {errors.bairro && touchedFields.has('bairro') && (
                                            <p className="text-xs text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.bairro}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cidade">Cidade *</Label>
                                        <Input
                                            id="cidade"
                                            value={formData.cidade || ""}
                                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                                            onBlur={() => handleFieldBlur('cidade')}
                                            className={cn(
                                                errors.cidade && touchedFields.has('cidade') && "border-destructive"
                                            )}
                                            placeholder="Nome da cidade"
                                        />
                                        {errors.cidade && touchedFields.has('cidade') && (
                                            <p className="text-xs text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.cidade}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="CEP">CEP *</Label>
                                            <Input
                                                id="CEP"
                                                value={formData.CEP || ""}
                                                onChange={(e) => {
                                                    const formatted = formatCEP(e.target.value)
                                                    handleInputChange('CEP', formatted)
                                                }}
                                                onBlur={() => handleFieldBlur('CEP')}
                                                className={cn(
                                                    errors.CEP && touchedFields.has('CEP') && "border-destructive"
                                                )}
                                                placeholder="12345-678"
                                            />
                                            {errors.CEP && touchedFields.has('CEP') && (
                                                <p className="text-xs text-destructive flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.CEP}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="UF">UF *</Label>
                                            <Input
                                                id="UF"
                                                value={formData.UF || ""}
                                                onChange={(e) => handleInputChange('UF', e.target.value.toUpperCase())}
                                                onBlur={() => handleFieldBlur('UF')}
                                                className={cn(
                                                    errors.UF && touchedFields.has('UF') && "border-destructive"
                                                )}
                                                placeholder="SP"
                                                maxLength={2}
                                            />
                                            {errors.UF && touchedFields.has('UF') && (
                                                <p className="text-xs text-destructive flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.UF}
                                                </p>
                                            )}
                                        </div>
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
                                    value={formData.observacoes || ""}
                                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                                    placeholder="Informações adicionais sobre o cliente..."
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
                                    onClick={handleSave}
                                    disabled={saving} //|| !isFormValid()}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {editingClient ? 'Atualizando...' : 'Cadastrando...'}
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            {editingClient ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
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