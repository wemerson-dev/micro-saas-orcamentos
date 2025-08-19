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
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import axios from "axios"

export default function pagUser() {
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [uploadStatus, setUploadStatus] = useState<string>("")

       // Função para decodificar o token JWT e obter o userId
    const getUserIdFromToken = (token: string): string | null => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            // O backend assina o JWT como { id: usuario.id }
            return payload.id || payload.userId || null;
        } catch (error) {
            console.error("Erro ao decodificar token:", error);
            return null;
        }
    }

    const handleLogoUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploadStatus("") // Limpar status anterior

        // Validar arquivo
        if (!logoFile) {
            setUploadStatus("Por favor, selecione uma imagem.")
            return
        }
        if (!logoFile.type.startsWith("image/")) {
            setUploadStatus("Apenas arquivos de imagem são permitidos (PNG, JPEG, etc.).")
            return
        }
        if (logoFile.size > 2 * 1024 * 1024) {
            setUploadStatus("O arquivo excede o limite de 2MB.")
            return
        }

        // Validar token
        const token = localStorage.getItem("token") // Substitua pelo seu método de autenticação
        console.log("Token encontrado:", token);
        if (!token) {
            setUploadStatus("Token de autenticação não encontrado. faça o login novamente...")
            return
        }

        // Obter userId do token
        const userId = getUserIdFromToken(token);
        console.log("userId extraído:", userId);
        if (!userId) {
            setUploadStatus("Não foi possível obter o ID do usuário. Verifique o token.")
            return
        }        

        // Criar FormData
        const formData = new FormData()
        formData.append("logo", logoFile)
        formData.append("userId", userId)

        // Logar conteúdo do FormData para depuração
        console.log("FormData conteúdo:")
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1])
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/usuario/upload/logo`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Não definir Content-Type; axios gerencia automaticamente
                },
            })
            setUploadStatus("Logo enviada com sucesso! Caminho: " + response.data.caminho)
            console.log("Resposta do servidor:", response.data)
        } catch (error: any) {
            const errorMessage = error.response?.data?.erro || error.message || "Erro ao enviar logo. Tente novamente."
            setUploadStatus(errorMessage)
            console.error("Erro na requisição:", error.response || error)
        }
    }

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />            
                <div className="flex justify-center items-center min-h-screen">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Perfil do Usuário</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>                                           
                </div>
            </header>
            <div className="w-full p-6 transition-all duration-300">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Perfil do Usuário</CardTitle>
                    </CardHeader>               
                    <CardContent>
                        <div className="flex flex-col md:flex-row md:items-start gap-8">
                            <div className="flex flex-col items-center gap-4 md:w-1/3">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage className="rounded-full" src="https://github.com/shadcn.png" alt="Usuário" />
                                    <AvatarFallback>US</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Alterar foto</Button>
                                <form onSubmit={handleLogoUpload} className="flex flex-col items-center gap-2">
                                    <Label htmlFor="logo">Logo da Empresa</Label>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                    />
                                    <Button type="submit">Enviar Logo</Button>
                                    {uploadStatus && <p className="text-sm">{uploadStatus}</p>}
                                </form>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-12 md:grid-cols-3 gap-2.5">
                                    <div>
                                        <Label htmlFor="name">Nome</Label>
                                        <Input className="col-span-6" id="name" placeholder="Nome completo" defaultValue="" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">E-Mail</Label>
                                        <Input id="email" placeholder="insira se Email" defaultValue="" />
                                    </div>
                                    <div>
                                        <Label htmlFor="wordpass">Senha</Label>
                                        <Input id="wordpass" placeholder="Sua Senha" defaultValue="******" />
                                    </div>  
                                    <div>
                                        <Label htmlFor="company">Endereco</Label>
                                        <Input id="company" placeholder="Endereço" defaultValue="" />
                                    </div>
                                    <div>
                                        <Label htmlFor="bairro">Bairro</Label>
                                        <Input className="col-span-6" id="Bairro" placeholder="Bairro" defaultValue="" />
                                    </div>
                                    <div>
                                        <Label htmlFor="number">Nº</Label>
                                        <Input id="number" placeholder="Número" defaultValue="" />
                                    </div>
                                    <div>
                                        <Label htmlFor="city">Cidade</Label>
                                        <Input id="city" placeholder="Informe a Cidade" defaultValue="" />
                                    </div>
                                    <div>
                                        <Label htmlFor="cPostal">CEP</Label>
                                        <Input id="cPostal" placeholder="Informe o CEP" defaultValue="" />
                                    </div>
                                    <div>
                                        <Label htmlFor="uf">UF</Label>
                                        <Input id="uf" placeholder="Informe a UF" defaultValue="" />
                                    </div>    
                                </div>
                                <Separator />
                                <div className="flex justify-end mt-2">
                                    <Button>Salvar Alterações</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>                    
        </SidebarInset>
    )
}
                                    


                                
                    
                                
                    
                                
                    