import { Request, Response, Router } from "express";
import prisma from "../prisma";
//import router from "./usuario.routes";

const OrcamentoController = {
    async criar(req: Request, res: Response) {
        try {
            const { descricao, valor, clienteId } = req.body;
            
            const newOrcamento = await prisma.orcamento.create({
                data: {
                    descricao,
                    valor,
                    clienteId,
                },
            }); 
            res.status(201).json(newOrcamento);
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar orçamento" });
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