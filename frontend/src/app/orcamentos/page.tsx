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
import { toast } from "sonner"
import { useState as useModalState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"

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

export default function NovoOrcamento() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [itens, setItens] = useState<Item[]>([{ quantidade: 1, descricao: "", precoUnitario: 0 }])
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarPerguntaPDF, setMostrarPerguntaPDF] = useState(false)
  const [orcamentoId, setOrcamentoId] = useState<string | null>(null)
  const [baixandoPDF, setBaixandoPDF] = useState(false)
  const [pdfDisponivel, setPdfDisponivel] = useState(false)

  useEffect(() => {
    fetch("http://localhost:5000/Cliente/listar")
      .then(res => res.json())
      .then(data => setClientes(data))
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

  const validarFormulario = () => {
    if (!clienteSelecionado) {
      toast.error("Selecione um cliente antes de salvar.")
      return false
    }
    for (const item of itens) {
      if (!item.descricao.trim() || item.quantidade <= 0 || item.precoUnitario <= 0) {
        toast.error("Todos os itens devem ter quantidade, descrição e preço maior que zero.")
        return false
      }
    }
    return true
  }

  const salvarOrcamento = async () => {
    if (!validarFormulario()) return
    setSalvando(true)
    setMensagem(null)
    setErro(null)
    setMostrarPerguntaPDF(false)

    try {
      const payload = {
        clienteId: clienteSelecionado!.id,
        numOrc: 9,
        dataEmissao: new Date().toISOString(),
        itens,
      }

      const res = await fetch("http://localhost:5000/Orcamento/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const erro = await res.text()
        setErro("Erro ao salvar orçamento: " + erro)
        return
      }

      const data = await res.json()
      setMensagem("Orçamento salvo com sucesso!")
      setOrcamentoId(data.id)
      setMostrarPerguntaPDF(true)
    } catch (err: any) {
      setErro("Erro ao salvar: " + err.message)
    } finally {
      setSalvando(false)
    }
  }

  const handleDownloadPDF = async () => {
    setBaixandoPDF(true)
    try {
      window.open(`http://localhost:5000/Orcamento/${orcamentoId}/pdf`, "_blank")
      setPdfDisponivel(true)
    } finally {
      setBaixandoPDF(false)
      setMostrarPerguntaPDF(false)
    }
  }

  const limparFormulario = () => {
    setClienteSelecionado(null)
    setItens([{ quantidade: 1, descricao: "", precoUnitario: 0 }])
    setMensagem(null)
    setErro(null)
    setMostrarPerguntaPDF(false)
    setOrcamentoId(null)
    setBaixandoPDF(false)
    setPdfDisponivel(false)
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <Separator orientation="vertical" className="mr-2 data-[orientation:vertical]:h-4" />
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
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
          <CardHeader>
            <CardTitle>Novo Orçamento</CardTitle>
          </CardHeader>

          <CardContent className="space-y-1">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select onValueChange={(id) => {
                  const cliente = clientes.find(c => c.id === id)
                  setClienteSelecionado(cliente || null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
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
                <div><Label>NºOrçamento</Label><Input disabled value={'#'}/></div>
              </div>
            )}

            <Separator />
            <div className="space-y-4 mt-4">
              <Label>Itens do Orçamento</Label>
              {itens.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-1" type="number" value={item.quantidade} onChange={(e) => handleItemChange(index, "quantidade", e.target.value)} placeholder="Qtd." />
                  <Input className="col-span-6" value={item.descricao} onChange={(e) => handleItemChange(index, "descricao", e.target.value)} placeholder="Descrição" />
                  <Input className="col-span-2" type="number" value={(item.precoUnitario).toFixed(2)} onChange={(e) => handleItemChange(index, "precoUnitario", e.target.value)} placeholder="Valor unitário" />
                  <Input className="col-span-2" disabled value={`R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}`} />
                  <Button variant="ghost" size="icon" onClick={() => removerItem(index)} className="col-span-1"><Trash2 className="h-4 w-4" /></Button>
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
              {mensagem ? (
                <Button onClick={limparFormulario}>
                  Criar Novo Orçamento
                </Button>
              ) : (
                <Button onClick={salvarOrcamento} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar Orçamento"}
                </Button>
              )}
            </div>

            {mensagem && <div className="text-green-600 font-bold my-2">{mensagem}</div>}
            {erro && <div className="text-red-600 font-bold my-2">{erro}</div>}
            <Sheet open={mostrarPerguntaPDF} onOpenChange={setMostrarPerguntaPDF}>
              <SheetContent aria-modal="true" aria-labelledby="pdf-modal-title">
                <SheetHeader>
                  <SheetTitle id="pdf-modal-title">Download do PDF</SheetTitle>
                </SheetHeader>
                <div className="my-4">
                  <p>Deseja realizar o download do PDF deste orçamento?</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleDownloadPDF}
                      disabled={baixandoPDF}
                      aria-busy={baixandoPDF}
                    >
                      {baixandoPDF ? "Gerando PDF..." : "Sim, baixar PDF"}
                    </Button>
                    <Button variant="outline" onClick={() => setMostrarPerguntaPDF(false)}>
                      Não
                    </Button>
                  </div>
                </div>
                <SheetFooter />
              </SheetContent>
            </Sheet>
            {pdfDisponivel && (
              <div className="text-blue-600 my-2" role="status">
                PDF disponível para download
                <a
                  href={`http://localhost:5000/Orcamento/${orcamentoId}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-2"
                >
                  Clique aqui para baixar novamente
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
