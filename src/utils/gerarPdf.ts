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
}

export async function gerarPDF(orçamento: OrcamentoData): Promise<Buffer> {
  const templatePath = path.resolve(__dirname, '../templates/orcamento-template.html')
  const templateHtml = await fs.readFile(templatePath, 'utf-8')
  const template = handlebars.compile(templateHtml)

  const htmlFinal = template(orçamento)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()
  return Buffer.from(pdfBuffer)
}
