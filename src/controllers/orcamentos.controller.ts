import { Request, Response, RequestHandler } from "express";
import prisma from "../prisma";
import { gerarPDF } from "../utils/gerarPdf";
//import router from "./usuario.routes";



const OrcamentoController = {
    async criar(req: Request, res: Response) {
        try {
            const { numOrc, dataEmissao, itens,clienteId } = req.body;

            const itensOrc = itens.map(((item: { quantidade: string; precoUnitario: string; descricao: any; }) => {
                const quantidade = parseInt(item.quantidade);
                const precoUnitario = parseFloat(item.precoUnitario);
                const descricao = item.descricao;

                return { quantidade, precoUnitario, descricao };
            }));
            await prisma.$transaction(async(tx) =>{
                const lastNum = await tx.orcamento.findFirst({
                    orderBy: {numOrc:'desc'},
                })
                const nextNum = (lastNum?.numOrc ?? 0) + 1
                //await tx.orcamento.create({ data:{numOrc: nextNum, ...} })
            
            
            const newOrcamento = await prisma.orcamento.create({
                data: {
                    numOrc: nextNum,
                    dataEmissao,
                    itens: {
                        create: itensOrc,
                    },
                    clienteId,
                },
                include: {
                    itens: true,
                },
            }); 
            res.status(201).json(newOrcamento);
        })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao criar orçamento" });
        }
    },

    async listItens(req: Request, res: Response) {
        try {
            const itens = await prisma.itemOrcamento.findMany();
            res.status(200).json(itens);
        } catch (error) {
            res.status(500).json({ error: "Erro ao listar itens" });
        }
    },

    async listar(req: Request, res: Response) {
        try {
            const orcamentos = await prisma.orcamento.findMany();
            res.status(200).json(orcamentos);
        } catch (error) {
            res.status(500).json({ error: "Erro ao listar orçamentos" });
        }
    },

    async atualizarStatus(req: Request, res: Response) {
        try{
            const { id } = req.params;
            const { status } = req.body;

            const orcamentoAtualizado = await prisma.orcamento.update({
                where: { id },
                data: { status },
            });
            res.status(200).json(orcamentoAtualizado);
        }catch (error) {
            res.status(500).json({ error: "Erro ao atualizar status do orçamento" });
        }
    },

  gerarPDF:(async(req: Request, res: Response) => {
    try {
      const { id } = req.params
      const orcamento = await prisma.orcamento.findUnique({
        where: { id },
        include: { itens: true, cliente: { include: { usuario: true } } }
      })

      if (!orcamento) return res.status(404).send("Orçamento não encontrado")

      const itens = orcamento.itens.map(item => {
        const subtotal = item.quantidade * item.precoUnitario
        return {
          quantidade: item.quantidade,
          descricao: item.descricao,
          precoUnitario: item.precoUnitario.toFixed(2),
          subtotal: subtotal.toFixed(2)
        }
      })

      const totalGeral = itens.reduce((acc, item) => acc + parseFloat(item.subtotal), 0)

      const logoPathDb = orcamento.cliente.usuario.logoPath ?? undefined
      const baseUrl = `${req.protocol}://${req.get('host')}`
      const logoAbsoluteUrl = logoPathDb ? `${baseUrl}${logoPathDb}` : undefined

      const dataPDF = {
        numOrc: String(orcamento.numOrc),
        dataEmissao: new Date(orcamento.dataEmissao).toLocaleDateString(),
        cliente: {
            nome: orcamento.cliente.nome,
            endereco: orcamento.cliente.endereco,
            cidade: orcamento.cliente.cidade,
            telefone: orcamento.cliente.telefone ?? '',
            email: orcamento.cliente.email
        },
        itens,
        totalGeral: totalGeral.toFixed(2),
        logoPath: logoAbsoluteUrl
      }

      const pdfBuffer = await gerarPDF(dataPDF)
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", `inline; filename=orcamento_${orcamento.numOrc}.pdf`)
      res.send(pdfBuffer)

    } catch (error) {   
      console.error("Erro ao gerar PDF", error)
      console.log("Erro")
      res.status(500).send("Erro ao gerar PDF")
    }   
  }) as RequestHandler,
}    
export default OrcamentoController;