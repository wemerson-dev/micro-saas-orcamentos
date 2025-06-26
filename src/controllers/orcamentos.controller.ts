import { Request, Response, RequestHandler } from "express";
import prisma from "../prisma";
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

    gerarPDF: (async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const orcamento = await prisma.orcamento.findUnique({
                where: { id },
                include: { itens: true, cliente: true }
            });
            if (!orcamento) return res.status(404).send("Orçamento não encontrado");

            // Importação dinâmica para evitar problemas em ambientes sem pdfkit
            const PDFDocument = (await import('pdfkit')).default;
            const doc = new PDFDocument();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=orcamento_${orcamento.numOrc}.pdf`);
            doc.pipe(res);

            doc.fontSize(18).text(`Orçamento #${orcamento.numOrc}`);
            doc.moveDown();
            doc.fontSize(12).text(`Cliente: ${orcamento.cliente.nome}`);
            doc.text(`Endereço: ${orcamento.cliente.endereco}`);
            doc.text(`Cidade: ${orcamento.cliente.cidade}`);
            doc.text(`Telefone: ${orcamento.cliente.telefone}`);
            doc.text(`E-mail: ${orcamento.cliente.email}`);
            doc.text(`Data: ${new Date(orcamento.dataEmissao).toLocaleDateString()}`);
            doc.moveDown();

            doc.fontSize(14).text('Itens do Orçamento:');
            doc.moveDown(0.5);
            let total = 0;
            orcamento.itens.forEach(item => {
                const subtotal = item.quantidade * item.precoUnitario;
                total += subtotal;
                doc.text(`${item.quantidade}x ${item.descricao} - R$${item.precoUnitario.toFixed(2)} (Subtotal: R$${subtotal.toFixed(2)})`);
            });
            doc.moveDown();
            doc.fontSize(14).text(`Total: R$${total.toFixed(2)}`);

            doc.end();
        } catch (error) {
            res.status(500).send("Erro ao gerar PDF");
        }
    }) as RequestHandler,
};

export default OrcamentoController;