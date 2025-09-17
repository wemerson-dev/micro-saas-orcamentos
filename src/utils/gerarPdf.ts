import fs from 'fs/promises'
import path from 'path'
import puppeteer from 'puppeteer'
import handlebars from 'handlebars'

interface OrcamentoData {
  numOrc: string | number
  dataEmissao: string
  cliente: {
    nome: string
    endereco: string
    cidade: string
    telefone: string | null
    email: string
  }
  itens: {
    quantidade: number
    descricao: string
    precoUnitario: string
    subtotal: string
  }[]
  totalGeral: string
  logoPath?: string
  usuario: {
    nome: string
    email: string
    endereco: string
    bairro: string
    cidade: string
    CEP: string
    numero: number
    telefone: string
    UF: string
  }
  usuarioIniciais?: string
}

export async function gerarPDF(orçamento: OrcamentoData): Promise<Buffer> {
  const templatePath = path.resolve(__dirname, '../templates/orcamento-template.html')
  const templateHtml = await fs.readFile(templatePath, 'utf-8')
  const template = handlebars.compile(templateHtml)

  // Adiciona as iniciais do nome do usuário ao objeto orçamento
  const nomeCompleto = orçamento.usuario.nome
  const partesDoNome = nomeCompleto.split(' ')
  let iniciais = ''
  if (partesDoNome.length > 0) {
    iniciais += partesDoNome[0].charAt(0).toUpperCase()
  }
  if (partesDoNome.length > 1) {
    iniciais += partesDoNome[1].charAt(0).toUpperCase()
  }
  orçamento.usuarioIniciais = iniciais

  const htmlFinal = template(orçamento)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()
  return Buffer.from(pdfBuffer)
}
