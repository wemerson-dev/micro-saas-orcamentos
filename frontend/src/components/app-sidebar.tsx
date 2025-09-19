"use client"

import React, { useState, useEffect } from "react"
import {
  AudioWaveform,
  Folders,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Users,
  FileStack,
  ChartNoAxesCombined,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "Carregando...",
    email: "...",
    avatar: "/avatars/shadcn.jpg",
  })

  useEffect(() => {
    function getCookie(name: string) {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
    }

    const userId = getCookie("userId")
    const token = getCookie("token")

    if (userId && token) {
      // Assumindo que o endpoint para buscar dados do usuário é /Usuario/{id}
      fetch(`http://localhost:5000/usuario/perfil`, {
        headers: {
          // Adiciona o token de autenticação no cabeçalho da requisição
          // para que a API autorize o acesso aos dados.
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async(res) => {
          if (!res.ok) {
            // Se a resposta não for OK, o corpo provavelmente é HTML (página de erro) ou texto.
            // Devemos ler como texto para evitar o erro de parsing de JSON.
            const errorText = await res.text();
            console.error("A API não retornou JSON. Conteúdo da resposta:", errorText);
            throw new Error(`Falha ao buscar dados do usuário. Status: ${res.status}`);
          }
          return res.json()
        })
        .then((data) => {
          setUser({
            name: data.nome, // Ajuste os nomes dos campos conforme o retorno da sua API
            email: data.email,
            avatar: "C:/ProjetoMicroSaas/micro-saas-orcamentos/uploads/1753405051291.png", // Pode ser dinâmico também
          })
        })
        .catch((error) => {
          console.error("Erro ao buscar dados do usuário:", error)
          // Opcional: redirecionar para o login ou mostrar um estado de erro
          setUser({ name: "Erro", email: "Falha ao carregar", avatar: "/avatars/shadcn.jpg" })
        })
    }
  }, [])

  // Dados estáticos para o restante da sidebar
  const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Usuário",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Perfil do Usuário",
          url: "http://localhost:3000/usuarios",
        },  
      ],
    },
    {
      title: "Clientes",
      url: "#",
      icon: FileStack,
      items: [
        {
          title: "Cadastro de Clientes",
          url: "http://localhost:3000/clientes",
        },
      ],
    },
    {
      title: "Orçamentos",
      url: "#",
      icon: Folders,
      items: [
        {
          title: "Cadastro de Orçamentos",
          url: "http://localhost:3000/orcamentos",
        },
      ],
    },
    /*{
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },*/
  ],
  projects: [
    {
      name: "Dashboard",
      url: "http://localhost:3000/dashboard",
      icon: ChartNoAxesCombined,
    },
    /*{
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },*/
    /*{
      name: "Travel",
      url: "#",
      icon: Map,
    },*/
  ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
