// =============================================================================
// 2. CONTROLLER DE ORÇAMENTOS CORRIGIDO
// src/controllers/orcamentos.controller.ts
// =============================================================================

import { Request, Response, RequestHandler } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../prisma";
import { gerarPDF } from "../utils/gerarPdf";

const OrcamentoController = {
    async criar(req: AuthenticatedRequest, res: Response) {
        try {
            const { numOrc, dataEmissao, itens, clienteId } = req.body;
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // ← VERIFICAR SE CLIENTE PERTENCE AO USUÁRIO
            const cliente = await prisma.cliente.findFirst({
                where: { id: clienteId, usuarioId }
            });

            if (!cliente) {
                res.status(404).json({ error: "Cliente não encontrado ou sem permissão" });
                return;
            }

            const itensOrc = itens.map((item: { quantidade: string; precoUnitario: string; descricao: any; }) => {
                const quantidade = parseInt(item.quantidade);
                const precoUnitario = parseFloat(item.precoUnitario);
                const descricao = item.descricao;
                return { quantidade, precoUnitario, descricao };
            });

            await prisma.$transaction(async (tx) => {
                // ← GERAR NÚMERO SEQUENCIAL APENAS PARA ESTE USUÁRIO
                const lastNum = await tx.orcamento.findFirst({
                    where: {
                        cliente: {
                            usuarioId // ← FILTRAR POR USUÁRIO
                        }
                    },
                    orderBy: { numOrc: 'desc' },
                });
                
                const nextNum = (lastNum?.numOrc ?? 0) + 1;

                const newOrcamento = await tx.orcamento.create({
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
                        cliente: true
                    },
                });

                const valorTotal = newOrcamento.itens.reduce((total, item) => {
                    return total + (item.quantidade * item.precoUnitario);
                }, 0);

                res.status(201).json({
                    ...newOrcamento,
                    valorTotal: valorTotal
                });
            });
        } catch (error) {
            console.error("Erro ao criar orçamento:", error);
            res.status(500).json({ error: "Erro ao criar orçamento" });
        }
    },

    async listar(req: AuthenticatedRequest, res: Response) {
        try {
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            console.log('📋 Listando orçamentos para usuário:', usuarioId);
            
            // ← FILTRAR ORÇAMENTOS POR USUÁRIO
            const orcamentos = await prisma.orcamento.findMany({
                where: {
                    cliente: {
                        usuarioId // ← FILTRO CRÍTICO
                    }
                },
                include: {
                    cliente: true,
                    itens: true
                },
                orderBy: {
                    dataEmissao: 'desc'
                }
            });

            console.log(`📊 Encontrados ${orcamentos.length} orçamentos para o usuário`);

            const orcamentosComTotal = orcamentos.map(orcamento => {
                const valorTotal = orcamento.itens.reduce((total, item) => {
                    return total + (item.quantidade * item.precoUnitario);
                }, 0);

                return {
                    ...orcamento,
                    valorTotal: valorTotal
                };
            });

            res.status(200).json(orcamentosComTotal);
        } catch (error) {
            console.error("❌ Erro ao listar orçamentos:", error);
            res.status(500).json({ error: "Erro ao listar orçamentos" });
        }
    },

    async buscarPorId(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // ← VERIFICAR PERMISSÃO ANTES DE BUSCAR
            const orcamento = await prisma.orcamento.findFirst({
                where: { 
                    id,
                    cliente: {
                        usuarioId // ← FILTRAR POR USUÁRIO
                    }
                },
                include: {
                    cliente: true,
                    itens: true
                }
            });

            if (!orcamento) {
                res.status(404).json({ error: "Orçamento não encontrado ou sem permissão" });
                return;
            }

            const valorTotal = orcamento.itens.reduce((total, item) => {
                return total + (item.quantidade * item.precoUnitario);
            }, 0);

            res.json({
                ...orcamento,
                valorTotal: valorTotal
            });
        } catch (error) {
            console.error("Erro ao buscar orçamento:", error);
            res.status(500).json({ error: "Erro ao buscar orçamento" });
        }
    },

    async atualizarStatus(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // ← VERIFICAR PERMISSÃO
            const orcamentoExistente = await prisma.orcamento.findFirst({
                where: {
                    id,
                    cliente: { usuarioId }
                }
            });

            if (!orcamentoExistente) {
                res.status(404).json({ error: "Orçamento não encontrado ou sem permissão" });
                return;
            }

            const orcamentoAtualizado = await prisma.orcamento.update({
                where: { id },
                data: { status },
                include: {
                    cliente: true,
                    itens: true
                }
            });

            const valorTotal = orcamentoAtualizado.itens.reduce((total, item) => {
                return total + (item.quantidade * item.precoUnitario);
            }, 0);

            res.status(200).json({
                ...orcamentoAtualizado,
                valorTotal: valorTotal
            });
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            res.status(500).json({ error: "Erro ao atualizar status do orçamento" });
        }
    },

    async deletar(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // ← VERIFICAR PERMISSÃO
            const orcamento = await prisma.orcamento.findFirst({
                where: {
                    id,
                    cliente: { usuarioId }
                },
                include: { itens: true }
            });

            if (!orcamento) {
                res.status(404).json({ error: "Orçamento não encontrado ou sem permissão" });
                return;
            }

            // Deletar em transação
            await prisma.$transaction(async (tx) => {
                // Deletar itens primeiro
                await tx.itemOrcamento.deleteMany({
                    where: { orcamentoId: id }
                });
                
                // Deletar orçamento
                await tx.orcamento.delete({
                    where: { id }
                });
            });

            res.json({ message: "Orçamento deletado com sucesso" });
        } catch (error) {
            console.error("Erro ao deletar orçamento:", error);
            res.status(500).json({ error: "Erro ao deletar orçamento" });
        }
    },

    gerarPDF: (async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // ← VERIFICAR PERMISSÃO ANTES DE GERAR PDF
            const orcamento = await prisma.orcamento.findFirst({
                where: {
                    id,
                    cliente: { usuarioId } // ← FILTRO CRÍTICO
                },
                include: { 
                    itens: true, 
                    cliente: { 
                        include: { usuario: true } 
                    } 
                }
            });

            if (!orcamento) {
                res.status(404).json({ error: "Orçamento não encontrado ou sem permissão" });
                return;
            }

            const itens = orcamento.itens.map(item => {
                const subtotal = item.quantidade * item.precoUnitario;
                return {
                    quantidade: item.quantidade,
                    descricao: item.descricao,
                    precoUnitario: item.precoUnitario.toFixed(2),
                    subtotal: subtotal.toFixed(2)
                };
            });

            const totalGeral = itens.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

            const logoPathDb = orcamento.cliente.usuario.logoPath ?? undefined;
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const logoAbsoluteUrl = logoPathDb ? `${baseUrl}${logoPathDb}` : undefined;

            const dataPDF = {
                numOrc: String(orcamento.numOrc),
                dataEmissao: new Date(orcamento.dataEmissao).toLocaleDateString('pt-BR'),
                status: orcamento.status,
                cliente: {
                    nome: orcamento.cliente.nome,
                    endereco: orcamento.cliente.endereco,
                    cidade: orcamento.cliente.cidade,
                    telefone: orcamento.cliente.telefone ?? '',
                    email: orcamento.cliente.email,
                },
                itens,
                totalGeral: totalGeral.toFixed(2),
                logoPath: logoAbsoluteUrl,
                usuario: {
                    nome: orcamento.cliente.usuario.nome,
                    email: orcamento.cliente.usuario.email,
                    endereco: orcamento.cliente.usuario.endereco ?? '',
                    bairro: orcamento.cliente.usuario.bairro ?? '',
                    cidade: orcamento.cliente.usuario.cidade ?? '',
                    CEP: orcamento.cliente.usuario.CEP ?? '',
                    numero: orcamento.cliente.usuario.numero ?? 0,
                    telefone: orcamento.cliente.usuario.telefone ?? '',
                    UF: orcamento.cliente.usuario.UF ?? '',
                }
            };

            const pdfBuffer = await gerarPDF(dataPDF);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename=orcamento_${orcamento.numOrc}.pdf`);
            res.send(pdfBuffer);

        } catch (error) {
            console.error("Erro ao gerar PDF", error);
            res.status(500).json({ error: "Erro ao gerar PDF" });
        }
    }) as RequestHandler,
};

export default OrcamentoController;



/*
import { Request, Response, RequestHandler } from "express";
import prisma from "../prisma";
import { gerarPDF } from "../utils/gerarPdf";

const OrcamentoController = {
    async criar(req: Request, res: Response) {
        try {
            const { numOrc, dataEmissao, itens, clienteId } = req.body;

            const itensOrc = itens.map(((item: { quantidade: string; precoUnitario: string; descricao: any; }) => {
                const quantidade = parseInt(item.quantidade);
                const precoUnitario = parseFloat(item.precoUnitario);
                const descricao = item.descricao;

                return { quantidade, precoUnitario, descricao };
            }));

            await prisma.$transaction(async (tx) => {
                const lastNum = await tx.orcamento.findFirst({
                    orderBy: { numOrc: 'desc' },
                });
                const nextNum = (lastNum?.numOrc ?? 0) + 1;

                const newOrcamento = await tx.orcamento.create({
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
                        cliente: true
                    },
                });

                // Calcular valor total do orçamento criado
                const valorTotal = newOrcamento.itens.reduce((total, item) => {
                    return total + (item.quantidade * item.precoUnitario);
                }, 0);

                // Retornar com valor total calculado
                res.status(201).json({
                    ...newOrcamento,
                    valorTotal: valorTotal
                });
            });
        } catch (error) {
            console.error("Erro ao criar orçamento:", error);
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

    // ✅ CORREÇÃO PRINCIPAL: Incluir cliente e itens na listagem
    async listar(req: Request, res: Response) {
        try {
            console.log('📋 Listando orçamentos com cliente e itens...');
            
            // Buscar orçamentos com cliente e itens incluídos
            const orcamentos = await prisma.orcamento.findMany({
                include: {
                    cliente: true,  // ← INCLUIR dados do cliente
                    itens: true     // ← INCLUIR itens para calcular total
                },
                orderBy: {
                    dataEmissao: 'desc' // Ordenar do mais recente
                }
            });

            console.log(`📊 Encontrados ${orcamentos.length} orçamentos`);

            // ✅ CALCULAR valor total para cada orçamento
            const orcamentosComTotal = orcamentos.map(orcamento => {
                const valorTotal = orcamento.itens.reduce((total, item) => {
                    return total + (item.quantidade * item.precoUnitario);
                }, 0);

                console.log(`💰 Orçamento ${orcamento.numOrc}: ${valorTotal} (${orcamento.itens.length} itens)`);

                return {
                    ...orcamento,
                    valorTotal: valorTotal // ← ADICIONAR campo calculado
                };
            });

            res.status(200).json(orcamentosComTotal);
        } catch (error) {
            console.error("❌ Erro ao listar orçamentos:", error);
            res.status(500).json({ error: "Erro ao listar orçamentos" });
        }
    },

    // ✅ NOVA FUNÇÃO: Buscar orçamento específico
    async buscarPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const orcamento = await prisma.orcamento.findUnique({
                where: { id },
                include: {
                    cliente: true,
                    itens: true
                }
            });

            if (!orcamento) {
                res.status(404).json({ error: "Orçamento não encontrado" });
                return;
            }

            // Calcular valor total
            const valorTotal = orcamento.itens.reduce((total, item) => {
                return total + (item.quantidade * item.precoUnitario);
            }, 0);

            res.json({
                ...orcamento,
                valorTotal: valorTotal
            });
        } catch (error) {
            console.error("Erro ao buscar orçamento:", error);
            res.status(500).json({ error: "Erro ao buscar orçamento" });
        }
    },

    async atualizarStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const orcamentoAtualizado = await prisma.orcamento.update({
                where: { id },
                data: { status },
                include: {
                    cliente: true,
                    itens: true
                }
            });

            // Calcular valor total
            const valorTotal = orcamentoAtualizado.itens.reduce((total, item) => {
                return total + (item.quantidade * item.precoUnitario);
            }, 0);

            res.status(200).json({
                ...orcamentoAtualizado,
                valorTotal: valorTotal
            });
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            res.status(500).json({ error: "Erro ao atualizar status do orçamento" });
        }
    },

    gerarPDF: (async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const orcamento = await prisma.orcamento.findUnique({
                where: { id },
                include: { itens: true, cliente: { include: { usuario: true } } }
            });

            if (!orcamento) return res.status(404).send("Orçamento não encontrado");

            const itens = orcamento.itens.map(item => {
                const subtotal = item.quantidade * item.precoUnitario;
                return {
                    quantidade: item.quantidade,
                    descricao: item.descricao,
                    precoUnitario: item.precoUnitario.toFixed(2),
                    subtotal: subtotal.toFixed(2)
                };
            });

            const totalGeral = itens.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

            const logoPathDb = orcamento.cliente.usuario.logoPath ?? undefined;
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const logoAbsoluteUrl = logoPathDb ? `${baseUrl}${logoPathDb}` : undefined;

            const dataPDF = {
                numOrc: String(orcamento.numOrc),
                dataEmissao: new Date(orcamento.dataEmissao).toLocaleDateString(),
                cliente: {
                    nome: orcamento.cliente.nome,
                    endereco: orcamento.cliente.endereco,
                    cidade: orcamento.cliente.cidade,
                    telefone: orcamento.cliente.telefone ?? '',
                    email: orcamento.cliente.email,
                },
                itens,
                totalGeral: totalGeral.toFixed(2),
                logoPath: logoAbsoluteUrl,
                usuario: {
                    nome: orcamento.cliente.usuario.nome,
                    email: orcamento.cliente.usuario.email,
                    endereco: orcamento.cliente.usuario.endereco ?? '',
                    bairro: orcamento.cliente.usuario.bairro ?? '',
                    cidade: orcamento.cliente.usuario.cidade ?? '',
                    CEP: orcamento.cliente.usuario.CEP ?? '',
                    numero: orcamento.cliente.usuario.numero ?? 0,
                    telefone: orcamento.cliente.usuario.telefone ?? '',
                    UF: orcamento.cliente.usuario.UF ?? '',
                }
            };

            const pdfBuffer = await gerarPDF(dataPDF);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename=orcamento_${orcamento.numOrc}.pdf`);
            res.send(pdfBuffer);

        } catch (error) {
            console.error("Erro ao gerar PDF", error);
            res.status(500).send("Erro ao gerar PDF");
        }
    }) as RequestHandler,
};

export default OrcamentoController; */