// =============================================================================
// 1. CONTROLLER DE CLIENTE CORRIGIDO
// src/controllers/cliente.controller.ts
// =============================================================================

import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../prisma";

const clienteController = {
    async criar(req: AuthenticatedRequest, res: Response) {
        try {
            const { nome, email, telefone, endereco, bairro, numero, cidade, cgc, CEP, UF, observacoes, status } = req.body;
            const usuarioId = req.usuarioId; // ← OBTER DO TOKEN

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // Verificar se CGC já existe PARA ESTE USUÁRIO
            if (cgc) {
                const clienteExistente = await prisma.cliente.findFirst({
                    where: { 
                        cgc,
                        usuarioId // ← IMPORTANTE: Verificar apenas no escopo do usuário
                    }
                });

                if (clienteExistente) {
                    res.status(400).json({ error: "Cliente já cadastrado" });
                    return;
                }
            }

            // Verificar se email já existe PARA ESTE USUÁRIO
            const emailExistente = await prisma.cliente.findFirst({
                where: {
                    email,
                    usuarioId // ← IMPORTANTE: Verificar apenas no escopo do usuário
                }
            });

            if (emailExistente) {
                res.status(400).json({ error: "Email já cadastrado para outro cliente" });
                return;
            }

            const cliente = await prisma.cliente.create({
                data: {
                    nome,
                    email,
                    telefone,
                    endereco,
                    bairro,
                    numero: numero?.toString() || '0',
                    cidade,
                    cgc: cgc?.toString() || null,
                    CEP,
                    UF,
                    observacoes,
                    status: status || 'ativo',
                    usuarioId // ← ASSOCIAR AO USUÁRIO LOGADO
                },
            });

            const formatCgc = {
                ...cliente,
                cgc: cliente.cgc?.toString() || '',
            };
            
            res.status(201).json(formatCgc);
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            res.status(500).json({ error: "Erro ao criar cliente" });
        }
    },

    async listar(req: AuthenticatedRequest, res: Response) {
        try {
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            
            // ← FILTRAR APENAS CLIENTES DO USUÁRIO LOGADO
            const clientes = await prisma.cliente.findMany({
                where: { usuarioId },
                orderBy: { dataCadastro: 'desc' }
            });
            
            const formatCgc = clientes.map(cliente => ({
                ...cliente,
                cgc: cliente.cgc?.toString() || '',
            }));
            
            res.status(200).json(formatCgc);
        } catch (error) {
            console.error("Erro ao listar clientes", error);
            res.status(500).json({ error: "Erro ao listar clientes" });
        }
    },

    async cUpdate(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { nome, email, telefone, endereco, bairro, numero, cidade, cgc, CEP, UF, observacoes, status } = req.body;
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // ← VERIFICAR SE CLIENTE PERTENCE AO USUÁRIO
            const clienteExistente = await prisma.cliente.findFirst({
                where: { id, usuarioId }
            });

            if (!clienteExistente) {
                res.status(404).json({ error: "Cliente não encontrado ou sem permissão" });
                return;
            }

            // Verificar duplicação de CGC (exceto o próprio cliente)
            if (cgc && cgc !== clienteExistente.cgc) {
                const cgcDuplicado = await prisma.cliente.findFirst({
                    where: {
                        cgc,
                        usuarioId,
                        id: { not: id } // Excluir o próprio cliente
                    }
                });

                if (cgcDuplicado) {
                    res.status(400).json({ error: "CGC já cadastrado para outro cliente" });
                    return;
                }
            }

            // Verificar duplicação de email (exceto o próprio cliente)
            if (email !== clienteExistente.email) {
                const emailDuplicado = await prisma.cliente.findFirst({
                    where: {
                        email,
                        usuarioId,
                        id: { not: id }
                    }
                });

                if (emailDuplicado) {
                    res.status(400).json({ error: "Email já cadastrado para outro cliente" });
                    return;
                }
            }

            const updateClient = await prisma.cliente.update({
                where: { id },
                data: {
                    nome,
                    email,
                    telefone,
                    endereco,
                    bairro,
                    numero: numero?.toString() || '0',
                    cidade,
                    cgc: cgc?.toString() || null,
                    CEP,
                    UF,
                    observacoes,
                    status: status || 'ativo'
                },
            });
            
            const formatCgc = {
                ...updateClient,
                cgc: updateClient.cgc?.toString() || '',
            };
            
            res.json(formatCgc);
        } catch (error) {
            console.error("Erro ao atualizar cliente", error);
            res.status(500).json({ error: "Erro ao atualizar cliente" });
        }
    },

    async cDelete(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const usuarioId = req.usuarioId;
        
        try {
            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // ← VERIFICAR SE CLIENTE PERTENCE AO USUÁRIO
            const clienteExistente = await prisma.cliente.findFirst({
                where: { id, usuarioId }
            });

            if (!clienteExistente) {
                res.status(404).json({ error: "Cliente não encontrado ou sem permissão" });
                return;
            }

            // Verificar se há orçamentos vinculados
            const orcamentosVinculados = await prisma.orcamento.findMany({
                where: { clienteId: id }
            });

            if (orcamentosVinculados.length > 0) {
                res.status(400).json({ 
                    error: "Não é possível deletar cliente com orçamentos vinculados",
                    orcamentos: orcamentosVinculados.length
                });
                return;
            }

            await prisma.cliente.delete({ where: { id } });
            res.json({ message: "Cliente deletado com sucesso" });
        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            res.status(500).json({ error: "Erro ao deletar cliente" });
        }
    },

    // ← NOVA FUNÇÃO: Buscar cliente específico
    async buscarPorId(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            const cliente = await prisma.cliente.findFirst({
                where: { id, usuarioId } // ← FILTRAR POR USUÁRIO
            });

            if (!cliente) {
                res.status(404).json({ error: "Cliente não encontrado" });
                return;
            }

            const formatCgc = {
                ...cliente,
                cgc: cliente.cgc?.toString() || '',
            };

            res.json(formatCgc);
        } catch (error) {
            console.error("Erro ao buscar cliente:", error);
            res.status(500).json({ error: "Erro ao buscar cliente" });
        }
    }
};

export default clienteController;


/*import { Request, Response } from "express";
import prisma from "../prisma";

const clienteController = {
    async criar(req: Request, res: Response) {
        try {
            const { nome, email, telefone, usuarioId, endereco, bairro, numero, cidade, cgc , CEP, UF, observacoes, status } = req.body;

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
                    endereco,
                    bairro,
                    numero: numero.toString(),
                    cidade,
                    cgc: cgc?.toString(),
                    CEP,
                    UF,
                    status: status || 'ativo',
                    observacoes,
                    usuario: { connect: { id: usuarioId } }
                },
            });

            const formatCgc = {
                ...cliente,
                cgc: cliente.cgc?.toString() || '',
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
                    cgc: cliente.cgc?.toString() || '',
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
            const { nome, email, telefone, endereco, bairro, numero, cidade, cgc, CEP, UF, observacoes, status } = req.body;

            const updateClient = await prisma.cliente.update({
                where: { id },
                data: {
                    nome,
                    email,
                    telefone,
                    endereco,
                    bairro,
                    numero: numero.toString(),
                    cidade,
                    cgc: cgc?.toString(),
                    CEP,
                    UF,
                    observacoes,
                    status: status || 'ativo'
                },
            });
                const formatCgc = {
                    ...updateClient,
                    cgc: updateClient.cgc?.toString() || '',
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

export default clienteController; */


/*
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware"; // ← ADICIONAR
import prisma from "../prisma";

const clienteController = {
    async criar(req: AuthenticatedRequest, res: Response) { // ← MUDAR Request para AuthenticatedRequest
        try {
            const { nome, email, telefone, endereco, bairro, numero, cidade, cgc } = req.body;
            const usuarioId = req.usuarioId; // ← OBTER DO MIDDLEWARE EM VEZ DO BODY

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // Validar se CGC já existe
            if (cgc) {
                const valCli = await prisma.cliente.findUnique({ where: { cgc } });
                if (valCli) {
                    res.status(400).json({ error: "Cliente já cadastrado" });
                    return;
                }
            }

            const cliente = await prisma.cliente.create({
                data: {
                    nome,
                    email,
                    telefone,
                    usuario: { connect: { id: usuarioId } },
                    endereco,
                    bairro,
                    numero: numero.toString() || '0',
                    cidade,
                    cgc: cgc || email, // ← USAR EMAIL COMO CGC SE NÃO FORNECIDO
                },
            });

            const formatCgc = {
                ...cliente,
                cgc: cliente.cgc?.toString() || '',
            };
            res.status(201).json(formatCgc);
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            res.status(500).json({ error: "Erro ao criar cliente" });
        }
    },
    
    // Atualizar outros métodos também:
    async listar(req: AuthenticatedRequest, res: Response) { // ← MUDAR Request para AuthenticatedRequest
        try {
            const usuarioId = req.usuarioId;
            
            // Listar apenas clientes do usuário logado
            const clientes = await prisma.cliente.findMany({
                where: { usuarioId } // ← FILTRAR POR USUÁRIO
            });
            
            const formatCgc = clientes.map(cliente => ({
                ...cliente,
                cgc: cliente.cgc?.toString() || '',
            }));
            res.status(200).json(formatCgc);
        } catch (error) {
            console.error("Erro ao listar clientes", error);
            res.status(500).json({ error: "Erro ao listar clientes" });
        }
    },

    async cUpdate(req: AuthenticatedRequest, res: Response) { // ← MUDAR Request para AuthenticatedRequest
        try {
            const { id } = req.params;
            const { nome, email, telefone, endereco, bairro, numero, cidade, cgc } = req.body;
            const usuarioId = req.usuarioId;

            // Verificar se o cliente pertence ao usuário logado
            const clienteExistente = await prisma.cliente.findFirst({
                where: { id, usuarioId }
            });

            if (!clienteExistente) {
                res.status(404).json({ error: "Cliente não encontrado" });
                return;
            }

            const updateClient = await prisma.cliente.update({
                where: { id },
                data: {
                    nome,
                    email,
                    telefone,
                    endereco,
                    bairro,
                    numero: numero.toString() || '0',
                    cidade,
                    cgc: cgc?.toString() || email,
                },
            });
            
            const formatCgc = {
                ...updateClient,
                cgc: updateClient.cgc?.toString() || '',
            };
            res.json(formatCgc);
        } catch (error) {
            console.error("Erro ao atualizar cliente", error);
            res.status(500).json({ error: "Erro ao atualizar cliente" });
        }
    },

    async cDelete(req: AuthenticatedRequest, res: Response) { // ← MUDAR Request para AuthenticatedRequest
        const { id } = req.params;
        const usuarioId = req.usuarioId;
        
        try {
            // Verificar se o cliente pertence ao usuário logado
            const clienteExistente = await prisma.cliente.findFirst({
                where: { id, usuarioId }
            });

            if (!clienteExistente) {
                res.status(404).json({ error: "Cliente não encontrado" });
                return;
            }

            await prisma.cliente.delete({ where: { id } });
            res.json({ message: "Cliente deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar cliente" });
        }
    },
};

export default clienteController; */