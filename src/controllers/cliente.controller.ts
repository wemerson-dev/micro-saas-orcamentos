import { Request, Response } from "express";
import prisma from "../prisma";

const clienteController = {
    async criar(req: Request, res: Response) {
        try {
            const { nome, email, telefone, usuarioId } = req.body;

            if(!usuarioId) {
                res.status(400).json({ error: "Usuário não informado" });
                return;
            }
            
            const cliente = await prisma.cliente.create({
                data: {
                    nome,
                    email,
                    telefone,
                    usuario: {connect:{id:usuarioId} },
                },
            });
            res.status(201).json(cliente);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao criar cliente" });
        }
    },
    async listar(req: Request, res: Response) {
        try {
            const clientes = await prisma.cliente.findMany();
            res.status(200).json(clientes);
        } catch (error) {
            res.status(500).json({ error: "Erro ao listar clientes" });
        }
    },
};      

export default clienteController;