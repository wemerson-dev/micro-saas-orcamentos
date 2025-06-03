"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"

  //interface Dafine o modelo de dados para consumir da API - DADOS DO CLIENTE
  interface Cliente {
  id: string
  nome: string
  cidade: string
  endereco: string
  telefone: string
  email: string
}

interface Item {
  quantidade: number
  descricao: string
  precoUnitario: number
}

// "export default function" - Função principal do Componente
export default function NovoOrcamento() {
  const [clientes, setClientes] = useState<Cliente[]>([])  //Cria uma lista para os clientes "useState" é usado para atualizar a tela quando houver mudança
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null) //Guarda o cliente escolhido
  const [itens, setItens] = useState<Item[]>([{ quantidade: 1, descricao: "", precoUnitario: 0 }]) // Cria uma lista vazia com os campos pre estabelecidos

  useEffect(() => {
    // Chamar sua API real aqui
    fetch("http://localhost:5000/Cliente/listar") //EndPoint da minha API - GET para listar clientes
      .then(res => res.json()) // Converte os Dados capturados para JSON 
      .then(data => setClientes(data)) // Salva os Dados 
  }, [])

  const handleItemChange = (index: number, campo: keyof Item, valor: string) => {
    const novosItens = [...itens]
    if (campo === "quantidade" || campo === "precoUnitario") {
      novosItens[index][campo] = parseFloat(valor)
    } else {
      novosItens[index][campo] = valor
    }
    setItens(novosItens)
  }

  const totalLinha = (item: Item) => item.quantidade * item.precoUnitario
  const totalGeral = itens.reduce((total, item) => total + totalLinha(item), 0)

  const adicionarItem = () => setItens([...itens, { quantidade: 1, descricao: "", precoUnitario: 0 }])
  const removerItem = (index: number) => setItens(itens.filter((_, i) => i !== index))

  return (
    <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <Separator orientation="vertical"
            className="mr-2 data-[orientation:vertical]:h-4"
            />
            <div>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">
                                Building Your Application
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Orçamentos</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>                
            </div>
        </header>
        <div className="w-full p-6 transition-all duration-300">
        <Card className="w-full"> 
            {/*Cabeçalho do Card*/}
            <CardHeader> 
                <CardTitle>Novo Orçamento</CardTitle>
            </CardHeader>

            {/*Conteudo do Card */}
            <CardContent className="space-y-1">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                {/*<Label>Selecione o cliente</Label>*/}
                <Select onValueChange={(id) => {
                    const cliente = clientes.find(c => c.id === id)
                    setClienteSelecionado(cliente || null)
                }}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                    {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <Button variant="outline">Novo Cliente</Button>
            </div>

            {clienteSelecionado && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                <div><Label>Empresa</Label><Input disabled value={clienteSelecionado.nome} /></div>
                <div><Label>Endereço</Label><Input disabled value={clienteSelecionado.endereco} /></div>
                <div><Label>Cidade</Label><Input disabled value={clienteSelecionado.cidade} /></div>
                <div><Label>Telefone</Label><Input disabled value={clienteSelecionado.telefone} /></div>
                <div><Label>E-mail</Label><Input disabled value={clienteSelecionado.email} /></div>
                </div>
            )}
            <Separator/>
            <div className="space-y-4 mt-4">
                <Label>Itens do Orçamento</Label>
                {itens.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input
                    className="col-span-2"
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
                    placeholder="Qtd."
                    />
                    <Input
                    className="col-span-4"
                    value={item.descricao}
                    onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                    placeholder="Descrição"
                    />
                    <Input
                    className="col-span-3"
                    type="number"
                    value={item.precoUnitario}
                    onChange={(e) => handleItemChange(index, "precoUnitario", e.target.value)}
                    placeholder="Valor unitário"
                    />
                    <Input
                    className="col-span-2"
                    disabled
                    value={`R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}`}
                    />
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerItem(index)}
                    className="col-span-1"
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                <Button onClick={adicionarItem} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Adicionar item
                </Button>
            </div>
            <div className="text-right font-semibold text-lg">
                Total do orçamento: R$ {totalGeral.toFixed(2)}
            </div>

            <div className="flex justify-end">
                <Button>Salvar Orçamento</Button>
            </div>
            </CardContent>
        </Card>
        </div>
    </SidebarInset>
  )
}
