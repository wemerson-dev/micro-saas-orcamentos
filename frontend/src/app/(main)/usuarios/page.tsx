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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
    Edit, 
    Save, 
    X, 
    Upload, 
    Camera, 
    MapPin, 
    Mail, 
    Phone,
    Building,
    User,
    Check,
    AlertCircle,
    Loader2
} from "lucide-react"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface UserData {
    id: string   
    nome: string
    email: string   
    senha: string
    endereco: string
    bairro: string
    numero: string
    cidade: string
    telefone: string
    CEP: string
    UF: string
    avatar?: string
    logo?: string
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
}

export default function UserProfilePage() {
    // Estados principais
    const [userData, setUserData] = useState<UserData | null>(null)
    const [formData, setFormData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
    const { session } = useAuth() // Obter a sessão do contexto de autenticação
    
    // Estados para uploads
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const [logoPreview, setLogoPreview] = useState<string>("")
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    
    // Estados de validação
    const [errors, setErrors] = useState<FormErrors>({})
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
    
    // Refs para inputs de arquivo
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)
    
    const { toast } = useToast()

    // Função para decodificar token JWT
    const getUserIdFromToken = (token: string): string | null => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            // O ID do usuário no payload do Supabase geralmente está em 'sub' ou 'user_metadata.sub'
            console.log(`Payload:${payload},PayloadSub: ${payload.sub}, PayloadId: ${payload.id} `)
            return payload.sub || payload.user_metadata.sub || null
        } catch (error) {
            console.error("Erro ao decodificar token:", error)
            return null
        }
    }

    // Validações em tempo real
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

    // Função para validar todos os campos
    const validateForm = useCallback((): boolean => {
        if (!formData) return false
        
        const newErrors: FormErrors = {}
        const fields = ['nome', 'email', 'telefone', 'endereco', 'bairro', 'cidade', 'CEP', 'UF', 'numero']
        
        fields.forEach(field => {
            const error = validateField(field, formData[field as keyof UserData] as string)
            if (error) newErrors[field as keyof FormErrors] = error
        })
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [formData, validateField])

    // Handler para mudanças nos inputs
    const handleInputChange = (name: string, value: string) => {
        if (!formData) return
        
        setFormData(prev => ({ ...prev!, [name]: value }))
        setHasUnsavedChanges(true)
        
        // Validação em tempo real apenas para campos tocados
        if (touchedFields.has(name)) {
            const error = validateField(name, value)
            setErrors(prev => ({ ...prev, [name]: error || undefined }))
        }
    }

    // Handler para quando o campo perde o foco
    const handleFieldBlur = (name: string) => {
        setTouchedFields(prev => new Set(prev).add(name))
        if (formData) {
            const error = validateField(name, formData[name as keyof UserData] as string)
            setErrors(prev => ({ ...prev, [name]: error || undefined }))
        }
    }

    // Formatação de telefone
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
        }
        return value
    }

    // Formatação de CEP
    const formatCEP = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }

    // Carregamento dos dados do usuário
    const loadUserData = async () => {
        try {
            setLoading(true)
            setError("")
            
            const token = session?.access_token
            if (!token) {
                setError("Token de autenticação não encontrado.")
                // Redirecionar para login se não houver token
                window.location.href = '/login'
                return
            }

            const userId = getUserIdFromToken(token)
            if (!userId) {
                console.log(`conteudo userId: ${userId}`)
                setError("Não foi possível obter o ID do usuário.")
                return
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            const response = await axios.get(`${apiUrl}/usuario/perfil`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data) {
                setUserData(response.data)
                setFormData(response.data)
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || error.message || "Erro ao carregar dados do usuário."
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

    // Handler para upload de arquivos
    const handleFileSelect = (type: 'avatar' | 'logo', file: File) => {
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Erro",
                description: "Apenas arquivos de imagem são permitidos",
                variant: "destructive"
            })
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Erro", 
                description: "O arquivo excede o limite de 2MB",
                variant: "destructive"
            })
            return
        }

        if (type === 'avatar') {
            setAvatarFile(file)
            const preview = URL.createObjectURL(file)
            setAvatarPreview(preview)
        } else {
            setLogoFile(file)
            const preview = URL.createObjectURL(file)
            setLogoPreview(preview)
        }
        
        setHasUnsavedChanges(true)
    }

    // Função para salvar alterações
    const handleSave = async () => {
        if (!formData || !validateForm()) {
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
            
            const token = session?.access_token
            const userId = getUserIdFromToken(token!)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

            // Simular progresso
            setUploadProgress(20)

            // Atualizar dados do usuário
            await axios.put(`${apiUrl}/usuario/perfil`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            setUploadProgress(60)

            // Upload de avatar se houver
            if (avatarFile) {
                const formDataAvatar = new FormData()
                formDataAvatar.append("avatar", avatarFile)
                formDataAvatar.append("userId", userId!)
                
                await axios.post(`${apiUrl}/usuario/upload/avatar`, formDataAvatar, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }

            setUploadProgress(80)

            // Upload de logo se houver
            if (logoFile) {
                const formDataLogo = new FormData()
                formDataLogo.append("logo", logoFile)
                formDataLogo.append("userId", userId!)
                
                await axios.post(`${apiUrl}/usuario/upload/logo`, formDataLogo, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }

            setUploadProgress(100)

            setUserData(formData)
            setIsEditing(false)
            setHasUnsavedChanges(false)
            setAvatarFile(null)
            setLogoFile(null)
            setAvatarPreview("")
            setLogoPreview("")
            
            toast({
                title: "Sucesso!",
                description: "Perfil atualizado com sucesso",
                variant: "default"
            })

        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || "Erro ao salvar alterações"
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

    // Função para cancelar edição
    const handleCancel = () => {
        setFormData(userData)
        setIsEditing(false)
        setHasUnsavedChanges(false)
        setErrors({})
        setTouchedFields(new Set())
        setAvatarFile(null)
        setLogoFile(null)
        setAvatarPreview("")
        setLogoPreview("")
    }

    // Efeito inicial
    useEffect(() => {
        loadUserData()
    }, [])

    // Cleanup de URLs de preview
    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview)
            if (logoPreview) URL.revokeObjectURL(logoPreview)
        }
    }, [avatarPreview, logoPreview])

    if (loading) {
        return (
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Skeleton className="h-4 w-48" />
                </header>
                <div className="p-6">
                    <Card className="w-full">
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex flex-col items-center gap-4 md:w-1/3">
                                    <Skeleton className="h-24 w-24 rounded-full" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        )
    }

    if (error) {
        return (
            <SidebarInset>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <AlertCircle className="h-12 w-12 text-destructive" />
                                <h3 className="text-lg font-semibold">Erro ao carregar perfil</h3>
                                <p className="text-sm text-muted-foreground">{error}</p>
                                <Button onClick={loadUserData}>Tentar novamente</Button>
                            </div>
                        </CardContent>
                    </Card>
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
                                <BreadcrumbPage>Perfil do Usuário</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                
                <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                        <Badge variant="secondary" className="text-xs">
                            Alterações não salvas
                        </Badge>
                    )}
                    
                    {!isEditing ? (
                        <Button 
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            size="sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Perfil
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Você tem alterações não salvas. Tem certeza que deseja descartar?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancel}>
                                            Descartar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            
                            <Button 
                                onClick={handleSave}
                                disabled={saving}
                                size="sm"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            <div className="p-6">
                {saving && uploadProgress > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">Salvando alterações...</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                    </div>
                )}

                <Card className="w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-6 w-6" />
                            <CardTitle>Perfil do Usuário</CardTitle>
                        </div>
                    </CardHeader>               
                    
                    <CardContent>
                        <div className="flex flex-col md:flex-row md:items-start gap-8">
                            {/* Seção de Avatar e Logo */}
                            <div className="flex flex-col items-center gap-6 md:w-1/3">
                                {/* Avatar */}
                                <div className="text-center space-y-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage 
                                                src={avatarPreview || userData?.avatar || "https://github.com/shadcn.png"} 
                                                alt="Avatar do usuário" 
                                            />
                                            <AvatarFallback>
                                                {userData?.nome?.charAt(0)?.toUpperCase() || "US"}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                                                onClick={() => avatarInputRef.current?.click()}
                                            >
                                                <Camera className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold">{userData?.nome}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {userData?.email}
                                        </p>
                                    </div>

                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileSelect('avatar', file)
                                        }}
                                    />
                                </div>

                                <Separator />

                                {/* Logo da Empresa */}
                                <div className="text-center space-y-4">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        Logo da Empresa
                                    </Label>
                                    
                                    <div className="relative">
                                        <div className="w-32 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
                                            {logoPreview || userData?.logo ? (
                                                <img 
                                                    src={logoPreview || userData?.logo} 
                                                    alt="Logo da empresa"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            ) : (
                                                <Building className="h-8 w-8 text-muted-foreground/50" />
                                            )}
                                        </div>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileSelect('logo', file)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Formulário */}
                            <div className="flex-1 space-y-6">
                                {/* Informações Pessoais */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Informações Pessoais
                                    </h3>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="nome">Nome da Empresa *</Label>
                                            <Input
                                                id="nome"
                                                value={formData?.nome || ""}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                                onBlur={() => handleFieldBlur('nome')}
                                                disabled={!isEditing}
                                                className={cn(
                                                    errors.nome && touchedFields.has('nome') && "border-destructive focus:border-destructive",
                                                    !isEditing && "bg-muted"
                                                )}
                                            />
                                            {errors.nome && touchedFields.has('nome') && (
                                                <p className="text-xs text-destructive flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.nome}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData?.email || ""}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                onBlur={() => handleFieldBlur('email')}
                                                disabled={!isEditing}
                                                className={cn(
                                                    errors.email && touchedFields.has('email') && "border-destructive",
                                                    !isEditing && "bg-muted"
                                                )}
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
                                                value={formData?.telefone || ""}
                                                onChange={(e) => {
                                                    const formatted = formatPhone(e.target.value)
                                                    handleInputChange('telefone', formatted)
                                                }}
                                                onBlur={() => handleFieldBlur('telefone')}
                                                disabled={!isEditing}
                                                placeholder="(11) 99999-9999"
                                                className={cn(
                                                    errors.telefone && touchedFields.has('telefone') && "border-destructive",
                                                    !isEditing && "bg-muted"
                                                )}
                                            />
                                            {errors.telefone && touchedFields.has('telefone') && (
                                                <p className="text-xs text-destructive flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.telefone}
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
                                                    value={formData?.endereco || ""}
                                                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                                                    onBlur={() => handleFieldBlur('endereco')}
                                                    disabled={!isEditing}
                                                    className={cn(
                                                        errors.endereco && touchedFields.has('endereco') && "border-destructive",
                                                        !isEditing && "bg-muted"
                                                    )}
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
                                                    value={formData?.numero || ""}
                                                    onChange={(e) => handleInputChange('numero', e.target.value)}
                                                    onBlur={() => handleFieldBlur('numero')}
                                                    disabled={!isEditing}
                                                    className={cn(
                                                        errors.numero && touchedFields.has('numero') && "border-destructive",
                                                        !isEditing && "bg-muted"
                                                    )}
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
                                                    value={formData?.bairro || ""}
                                                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                                                    onBlur={() => handleFieldBlur('bairro')}
                                                    disabled={!isEditing}
                                                    className={cn(
                                                        errors.bairro && touchedFields.has('bairro') && "border-destructive",
                                                        !isEditing && "bg-muted"
                                                    )}
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
                                                    value={formData?.cidade || ""}
                                                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                                                    onBlur={() => handleFieldBlur('cidade')}
                                                    disabled={!isEditing}
                                                    className={cn(
                                                        errors.cidade && touchedFields.has('cidade') && "border-destructive",
                                                        !isEditing && "bg-muted"
                                                    )}
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
                                                        value={formData?.CEP || ""}
                                                        onChange={(e) => {
                                                            const formatted = formatCEP(e.target.value)
                                                            handleInputChange('CEP', formatted)
                                                        }}
                                                        onBlur={() => handleFieldBlur('CEP')}
                                                        disabled={!isEditing}
                                                        placeholder="12345-678"
                                                        className={cn(
                                                            errors.CEP && touchedFields.has('CEP') && "border-destructive",
                                                            !isEditing && "bg-muted"
                                                        )}
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
                                                        value={formData?.UF || ""}
                                                        onChange={(e) => handleInputChange('UF', e.target.value.toUpperCase())}
                                                        onBlur={() => handleFieldBlur('UF')}
                                                        disabled={!isEditing}
                                                        placeholder="SP"
                                                        maxLength={2}
                                                        className={cn(
                                                            errors.UF && touchedFields.has('UF') && "border-destructive",
                                                            !isEditing && "bg-muted"
                                                        )}
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

                                {/* Estatísticas rápidas - visível apenas no modo visualização */}
                                {!isEditing && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Resumo da Conta</h3>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <Card>
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-green-100 rounded-lg">
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Perfil</p>
                                                                <p className="text-xs text-muted-foreground">Completo</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <Mail className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Email</p>
                                                                <p className="text-xs text-muted-foreground">Verificado</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                                <Building className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Empresa</p>
                                                                <p className="text-xs text-muted-foreground">Configurada</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Ações no modo de edição */}
                                {isEditing && (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>Campos marcados com * são obrigatórios</span>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline">
                                                            <X className="h-4 w-4 mr-2" />
                                                            Cancelar
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Você tem alterações não salvas. Todas as modificações serão perdidas.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={handleCancel}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                Descartar alterações
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                
                                                <Button 
                                                    onClick={handleSave}
                                                    disabled={saving || Object.keys(errors).length > 0}
                                                >
                                                    {saving ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Salvando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Salvar Alterações
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de ações adicionais */}
                {!isEditing && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Ações Adicionais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <Button variant="outline" size="sm">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Alterar Foto
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Alterar Logo
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Alterar Email
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Alterar Telefone
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </SidebarInset>
    )
}