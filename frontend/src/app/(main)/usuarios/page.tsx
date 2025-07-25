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
    const userId = "66219095-db77-46a5-9da5-c4ff27123b27" // Substitua pelo userId real (e.g., de um contexto de autenticação)

    const handleLogoUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!logoFile) {
            setUploadStatus("Por favor, selecione uma imagem.")
            return
        }

        const formData = new FormData()
        formData.append("logo", logoFile)
        formData.append("userId", userId)

        try {
            const response = await axios.post("/upload/logo", formData, {
                headers: {
                    // Não defina Content-Type manualmente; deixe axios gerenciar
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Substitua pelo seu método de autenticação
                },
            })
            setUploadStatus("Logo enviada com sucesso!")
        } catch (error: any) {
            setUploadStatus(error.response?.data?.erro || "Erro ao enviar logo. Tente novamente.")
            console.error(error)
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
                                <div>
                                    <Label htmlFor="name">Nome</Label>
                                    <Input className="flex flex-col w-70 mt-1" id="name" placeholder="Nome completo" defaultValue="Renan" />
                                </div>
                                <div>
                                    <Label className="mt-1.5" htmlFor="email">E-Mail</Label>
                                    <Input className="mt-1" id="email" placeholder="insira se Email" defaultValue="renan@gmail.com" />
                                </div>
                                <div>
                                    <Label className="mt-1.5" htmlFor="empresa">Empresa</Label>
                                    <Input className="mt-1" id="empresa" placeholder="Nome da empresa" defaultValue="GetDoc" />
                                </div>
                                <div>
                                    <Label className="mt-1.5" htmlFor="wordpass">Senha</Label>
                                    <Input className="mt-1" id="wordpass" placeholder="Sua Senha" defaultValue="******" />
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