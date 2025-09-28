"use client"

import React from "react"
import { useAuth } from "@/context/AuthContext"
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
  const { user: authUser } = useAuth()
  
  // Transformar dados do Supabase para o formato esperado pelo NavUser
  const user = {
    name: authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Usuário',
    email: authUser?.email || '',
    avatar: authUser?.user_metadata?.avatar_url || '/avatars/shadcn.jpg'
  }

  // Dados estáticos para o restante da sidebar
  const data = {
  teams: [
    {
      name: "MicroSaaS Orçamentos",
      logo: GalleryVerticalEnd,
      plan: "Professional",
    },
    {
      name: "Gestão Completa",
      logo: AudioWaveform,
      plan: "Premium",
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
          url: "/usuarios", // ✅ URL relativa
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
          url: "/clientes", // ✅ URL relativa
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
          url: "/orcamentos", // ✅ URL relativa
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard", // ✅ URL relativa
      icon: ChartNoAxesCombined,
    },
/*    {
      name: "Relatórios",
      url: "/relatorios", // ✅ URL relativa (página futura)
      icon: PieChart,
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