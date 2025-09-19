// =============================================================================
// 4. CONTROLLER DE USUÁRIO COM MELHORIAS
// src/controllers/usuario.controller.ts (APENAS OS MÉTODOS IMPORTANTES)
// =============================================================================

import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Interfaces para os corpos das requisições
interface RegistrarRequestBody {
    nome: string;
    email: string;
    senha: string;
    endereco?: string | null;
    bairro?: string | null;
    numero?: number | string | null;
    cidade?: string | null;
    telefone?: string | null;
    CEP?: string | null;
    UF?: string | null;
}

interface LoginRequestBody {
    email: string;
    senha: string;
}

interface AtualizarPerfilRequestBody {
    nome?: string;
    email?: string;
    endereco?: string | null;
    bairro?: string | null;
    numero?: number | string | null;
    cidade?: string | null;
    telefone?: string | null;
    CEP?: string | null;
    UF?: string | null;
}

interface AlterarSenhaRequestBody {
    senhaAtual: string;
    novaSenha: string;
}

const usuarioController = {
    // MÉTODO PARA REGISTRAR NOVO USUÁRIO
    async registrar(req: Request<{}, {}, RegistrarRequestBody>, res: Response) {
        try {
            const { nome, email, senha, endereco, bairro, cidade, CEP, numero, telefone, UF } = req.body;

            const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
            if (usuarioExistente) {
                res.status(400).json({ error: "E-mail já cadastrado!" });
                return;
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            // Processar o campo 'numero' para garantir que é um número ou null
            let numeroProcessado: number | null = null;
            if (numero !== undefined && numero !== null && numero !== '') {
                const parsedNumero = parseInt(numero.toString(), 10);
                if (!isNaN(parsedNumero)) {
                    numeroProcessado = parsedNumero;
                }
            }

            const novoUsuario = await prisma.usuario.create({
                data: { nome, email, senha: senhaHash, endereco, bairro, cidade, CEP, numero: numeroProcessado, telefone, UF },
            });

            res.status(201).json(novoUsuario);
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            res.status(500).json({ error: "Erro ao registrar usuário" });
        }
    },

    // MÉTODO PARA LOGIN
    async login(req: Request<{}, {}, LoginRequestBody>, res: Response) {
        try {
            const { email, senha } = req.body;

            const usuario = await prisma.usuario.findUnique({ where: { email } });
            if (!usuario) {
                res.status(400).json({ error: "Usuário não encontrado!" });
                return;
            }

            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
            if (!senhaCorreta) {
                res.status(400).json({ error: "Senha incorreta!" });
                return;
            } else {
                if (!process.env.JWT_SECRET) {
                    res.status(500).json({ error: "JWT_SECRET não definida no ambiente do servidor." });
                    return;
                }
                const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET as string, { expiresIn: "8h" });
                console.log("Token gerado", token);
                console.info('token ')
                res.json({ token, usuario });
                return;
            }
        } catch (error) {
            console.error("Erro ao fazer o login", error);
            res.status(500).json({ error: "Erro ao fazer login" });
            return
        }
    },

    // ← MÉTODO PARA BUSCAR DADOS DO PRÓPRIO USUÁRIO
    async buscarPerfil(req: AuthenticatedRequest, res: Response) {
        try {
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            const usuario = await prisma.usuario.findUnique({
                where: { id: usuarioId },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    endereco: true,
                    bairro: true,
                    numero: true,
                    cidade: true,
                    telefone: true,
                    CEP: true,
                    UF: true,
                    logoPath: true,
                    // ← NÃO RETORNAR A SENHA
                }
            });

            if (!usuario) {
                res.status(404).json({ error: "Usuário não encontrado" });
                return;
            }

            res.json(usuario);
        } catch (error) {
            console.error("Erro ao buscar perfil:", error);
            res.status(500).json({ error: "Erro ao buscar perfil do usuário" });
        }
    },

    // ← MÉTODO PARA ATUALIZAR DADOS DO PRÓPRIO USUÁRIO
    async atualizarPerfil(req: AuthenticatedRequest, res: Response) {
        try {
            const usuarioId = req.usuarioId;
            const { nome, email, endereco, bairro, numero, cidade, telefone, CEP, UF } = req.body as AtualizarPerfilRequestBody;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // Verificar se email já está em uso por outro usuário
            if (email) {
                const emailExistente = await prisma.usuario.findFirst({
                    where: {
                        email,
                        id: { not: usuarioId } // Excluir o próprio usuário
                    }
                });

                if (emailExistente) {
                    res.status(400).json({ error: "Email já está em uso por outro usuário" });
                    return;
                }
            }

            // Processar o campo 'numero' para garantir que é um número ou null
            let numeroProcessado: number | null = null;
            if (numero !== undefined && numero !== null && numero !== '') {
                const parsedNumero = parseInt(numero.toString(), 10);
                if (!isNaN(parsedNumero)) {
                    numeroProcessado = parsedNumero;
                }
            }

            const usuarioAtualizado = await prisma.usuario.update({
                where: { id: usuarioId },
                data: {
                    nome,
                    email,
                    endereco,
                    bairro,
                    numero: numeroProcessado,
                    cidade,
                    telefone,
                    CEP,
                    UF
                },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    endereco: true,
                    bairro: true,
                    numero: true,
                    cidade: true,
                    telefone: true,
                    CEP: true,
                    UF: true,
                    logoPath: true,
                }
            });

            res.json(usuarioAtualizado);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            res.status(500).json({ error: "Erro ao atualizar perfil" });
        }
    },

    // ← MÉTODO PARA ALTERAR SENHA
    async alterarSenha(req: AuthenticatedRequest, res: Response) {
        try {
            const usuarioId = req.usuarioId;
            const { senhaAtual, novaSenha } = req.body as AlterarSenhaRequestBody;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            if (!senhaAtual || !novaSenha) {
                res.status(400).json({ error: "Senha atual e nova senha são obrigatórias" });
                return;
            }

            if (novaSenha.length < 6) {
                res.status(400).json({ error: "Nova senha deve ter pelo menos 6 caracteres" });
                return;
            }

            // Buscar usuário com senha para validação
            const usuario = await prisma.usuario.findUnique({
                where: { id: usuarioId }
            });

            if (!usuario) {
                res.status(404).json({ error: "Usuário não encontrado" });
                return;
            }

            // Verificar senha atual
            const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
            if (!senhaValida) {
                res.status(400).json({ error: "Senha atual incorreta" });
                return;
            }

            // Criptografar nova senha
            const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

            await prisma.usuario.update({
                where: { id: usuarioId },
                data: { senha: novaSenhaCriptografada }
            });

            res.json({ message: "Senha alterada com sucesso" });
        } catch (error) {
            console.error("Erro ao alterar senha:", error);
            res.status(500).json({ error: "Erro ao alterar senha" });
        }
    },

    // ← MÉTODO PARA ESTATÍSTICAS DO USUÁRIO
    async estatisticasUsuario(req: AuthenticatedRequest, res: Response) {
        try {
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            // Buscar estatísticas isoladas por usuário
            const [totalClientes, totalOrcamentos, orcamentosAprovados, orcamentosPendentes] = await Promise.all([
                prisma.cliente.count({
                    where: { usuarioId }
                }),
                prisma.orcamento.count({
                    where: { cliente: { usuarioId } }
                }),
                prisma.orcamento.count({
                    where: {
                        cliente: { usuarioId },
                        status: 'aprovado'
                    }
                }),
                prisma.orcamento.count({
                    where: {
                        cliente: { usuarioId },
                        status: { in: ['pendente', 'enviado'] }
                    }
                })
            ]);

            // Valor total dos orçamentos do mês atual
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);

            const orcamentosMes = await prisma.orcamento.findMany({
                where: {
                    cliente: { usuarioId },
                    dataEmissao: { gte: inicioMes }
                },
                include: { itens: true }
            });

            const valorTotalMes = orcamentosMes.reduce((total, orcamento) => {
                const valorOrcamento = orcamento.itens.reduce((subtotal, item) => {
                    return subtotal + (item.quantidade * item.precoUnitario);
                }, 0);
                return total + valorOrcamento;
            }, 0);

            const estatisticas = {
                totalClientes,
                totalOrcamentos,
                orcamentosAprovados,
                orcamentosPendentes,
                taxaAprovacao: totalOrcamentos > 0 ? ((orcamentosAprovados / totalOrcamentos) * 100).toFixed(1) : '0',
                valorTotalMes: valorTotalMes.toFixed(2),
                ticketMedio: totalOrcamentos > 0 ? (valorTotalMes / totalOrcamentos).toFixed(2) : '0'
            };

            res.json(estatisticas);
        } catch (error) {
            console.error("Erro ao buscar estatísticas:", error);
            res.status(500).json({ error: "Erro ao buscar estatísticas" });
        }
    },

    // MÉTODO PARA LISTAR TODOS OS USUÁRIOS (ADICIONADO)
    async uListar(req: Request, res: Response) {
        try {
            const usuarios = await prisma.usuario.findMany();
            res.status(200).json(usuarios);
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
            res.status(500).json({ error: "Erro ao listar usuários" });
        }
    },

    // MÉTODO PARA BUSCAR USUÁRIO POR ID (ADICIONADO)
    async buscarPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const usuario = await prisma.usuario.findUnique({
                where: { id },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    endereco: true,
                    bairro: true,
                    cidade: true,
                    CEP: true,
                    numero: true,
                    telefone: true,
                    UF: true
                }
            });

            if (!usuario) {
                res.status(404).json({ error: "Usuário não encontrado" });
                return;
            }

            res.json(usuario);
        } catch (error) {
            console.error("Erro ao buscar usuário por ID:", error);
            res.status(500).json({ error: "Erro ao buscar usuário por ID" });
        }
    },

    // MÉTODO PARA UPLOAD DE AVATAR (PLACEHOLDER)
    async uploadAvatar(req: AuthenticatedRequest, res: Response) {
        try {
            res.status(200).json({ message: "Upload de avatar em desenvolvimento." });
        } catch (error) {
            console.error("Erro no upload de avatar:", error);
            res.status(500).json({ error: "Erro ao fazer upload de avatar" });
        }
    },

    // MÉTODO PARA UPLOAD DE LOGO (PLACEHOLDER)
    async uploadLogo(req: AuthenticatedRequest, res: Response) {
        try {
            // A lógica real de upload de logo provavelmente virá de src/controllers/uploadLogo.ts
            // Por enquanto, apenas um placeholder para remover o erro da rota.
            res.status(200).json({ message: "Upload de logo em desenvolvimento." });
        } catch (error) {
            console.error("Erro no upload de logo:", error);
            res.status(500).json({ error: "Erro ao fazer upload de logo" });
        }
    },
};

export default usuarioController;
