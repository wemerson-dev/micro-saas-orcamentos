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
                    cgc: BigInt(cgc),
                },
            });

            const formatCgc = {
                ...cliente,
                cgc: cliente.cgc.toString(),
            };
            res.status(201).json(formatCgc);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao criar cliente" });
        }
    },
    async listar(req: Request, res: Response) {
        try {
            const clientes = await prisma.cliente.findMany();
            //Tratamento para formatar o CGC    
            const formatCgc = clientes.map(cliente => (
                {
                    ...cliente,
                    cgc: cliente.cgc.toString(),
                }
            ));
            res.status(201).json(formatCgc);
        } catch (error) {
            console.error("Erro ao listar clientes",error);
            res.status(500).json({ error: "Erro ao listar clientes" });
        }
    },
    async cUpdate(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const { nome, email, telefone, endereco, bairro, numero, cidade, cgc } = req.body;

            const updateClient = await prisma.cliente.update({
                where: { id },
                data: {
                    nome,
                    email,
                    telefone,
                    endereco,
                    bairro,
                    numero: parseInt(numero),
                    cidade,
                    cgc: BigInt(cgc),
                },});
                const formatCgc = {
                    ...updateClient,
                    cgc: updateClient.cgc.toString(),
                };
            res.json(formatCgc)
        }
            catch (error) {
                console.error("Erro ao atualizar cliente",error);
        }
    },
    async cDelete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await prisma.cliente.delete({where: { id },});
            res.json({ message: "Cliente deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar cliente" });
        }
    },
};      

export default clienteController;