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
