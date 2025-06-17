import e, { Request, Response, Router } from "express";
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
    }
};

export default OrcamentoController;