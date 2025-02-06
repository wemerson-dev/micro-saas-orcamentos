import { Request, Response } from "express";
import prisma from "../prisma";

const clienteController = {
    async criar(req: Request, res: Response) {
        try {
            const { nome, email, telefone, usuarioId } = req.body;
            
            const cliente = await prisma.cliente.create({
                data: {
                    nome,
                    email,
                    telefone,
                    usuarioId,
                },
            });
            res.status(201).json(cliente);
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar cliente" });
        }
    }
};      