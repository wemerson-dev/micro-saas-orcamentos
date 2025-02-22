import { Request, Response } from "express";
import prisma from "../prisma";

const clienteController = {
    async criar(req: Request, res: Response) {
        try {
            const { nome, email, telefone, usuarioId, endereco, bairro, numero, cidade, cgc } = req.body;

            if(!usuarioId) {
                res.status(400).json({ error: "Usuário não informado" });
                return;
            }

            const valCli = await prisma.cliente.findUnique({ where: { cgc } });
            if (valCli) {
                res.status(400).json({ error: "Cliente já cadastrado" });
                return;
            }

    
            const cliente = await prisma.cliente.create({
                data: {
                    nome,
                    email,
                    telefone,
                    usuario: {connect:{id:usuarioId} },
                    endereco,
                    bairro,
                    numero: parseInt(numero),
                    cidade,
                    cgc,
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