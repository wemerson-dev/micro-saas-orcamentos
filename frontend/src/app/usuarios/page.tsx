import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"   
import {
    SidebarInset
  } from "@/components/ui/sidebar"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { AvatarFallback } from "@/components/ui/avatar"

export default function pagUser () {
    return(
        <SidebarInset >
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
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <Label htmlFor="name">Nome</Label>
                                <Input className="flex flex-col w-70 mt-1" id="name" placeholder="Nome completo" defaultValue="Renan"></Input>
                            </div>
                            <div>
                                <Label className="mt-1.5" htmlFor="email">E-Mail</Label>
                                <Input className="mt-1" id="email" placeholder="insira se Email" defaultValue="renan@gmail.com" ></Input>
                            </div>
                            <div>
                                <Label className="mt-1.5" htmlFor="empresa">Empresa</Label>
                                <Input className="mt-1" id="empresa" placeholder="Nome da empresa" defaultValue="GetDoc"></Input>
                            </div>
                            <div>
                                <Label className="mt-1.5" htmlFor="wordpass">Senha</Label>
                                <Input className="mt-1" id="wordpass" placeholder="Sua Senha" defaultValue="******"></Input>
                            </div>
                            <Separator/>
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