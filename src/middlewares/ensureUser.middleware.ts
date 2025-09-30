// src/middlewares/ensureUser.middleware.ts
// Middleware para garantir que usuário do Supabase existe na tabela Usuario

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import prisma from "../prisma";

/**
 * Middleware que garante que o usuário autenticado via Supabase
 * tem um registro correspondente na tabela Usuario do banco de dados.
 * 
 * Se não existir, cria automaticamente usando os dados do token.
 */
export const ensureUserExists = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuarioId = req.usuarioId;
    const usuario = req.usuario;

    if (!usuarioId) {
      console.warn('⚠️ ensureUserExists: usuarioId não encontrado no request');
      res.status(401).json({ 
        erro: "Usuário não autenticado",
        code: "NO_USER_ID"
      });
      return;
    }

    console.log(`🔍 Verificando existência do usuário: ${usuarioId}`);

    // Verificar se usuário já existe no banco
    let usuarioDB = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuarioDB) {
      console.log(`📝 Usuário ${usuarioId} não encontrado no banco, criando registro...`);

      // Verificar se o email já está em uso por outro ID
      const emailEmUso = await prisma.usuario.findUnique({
        where: { email: usuario?.email || '' }
      });

      if (emailEmUso && emailEmUso.id !== usuarioId) {
        console.error(`❌ Email ${usuario?.email} já está em uso por outro usuário: ${emailEmUso.id}`);
        res.status(409).json({ 
          erro: "Email já cadastrado no sistema",
          code: "EMAIL_IN_USE"
        });
        return;
      }

      // Criar usuário no banco usando ID do Supabase
      try {
        usuarioDB = await prisma.usuario.create({
          data: {
            id: usuarioId, // ✅ USA O MESMO ID DO SUPABASE
            nome: usuario?.nome || usuario?.email?.split('@')[0] || 'Usuário',
            email: usuario?.email || '',
            senha: 'SUPABASE_AUTH', // Placeholder, autenticação é pelo Supabase
            // Campos opcionais iniciam como null
            endereco: null,
            bairro: null,
            numero: null,
            cidade: null,
            telefone: null,
            CEP: null,
            UF: null,
            logoPath: null
          }
        });

        console.log(`✅ Usuário criado no banco com sucesso: ${usuarioDB.id} (${usuarioDB.email})`);
        
        // Adicionar usuário ao request para uso posterior
        req.usuarioDB = usuarioDB;

      } catch (createError: any) {
        console.error(`❌ Erro ao criar usuário no banco:`, createError);
        
        // Se erro de unique constraint no email, tentar buscar novamente
        if (createError.code === 'P2002' && createError.meta?.target?.includes('email')) {
          usuarioDB = await prisma.usuario.findUnique({
            where: { email: usuario?.email || '' }
          });
          
          if (usuarioDB) {
            console.log(`✅ Usuário encontrado após erro de unique: ${usuarioDB.id}`);
            req.usuarioDB = usuarioDB;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    } else {
      console.log(`✅ Usuário encontrado no banco: ${usuarioDB.id} (${usuarioDB.email})`);
      req.usuarioDB = usuarioDB;
    }

    next();

  } catch (error: any) {
    console.error('❌ Erro no middleware ensureUserExists:', error);
    res.status(500).json({ 
      erro: "Erro ao verificar/criar usuário no sistema",
      code: "ENSURE_USER_ERROR",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Estender interface AuthenticatedRequest para incluir usuarioDB
declare module "./auth.middleware" {
  interface AuthenticatedRequest {
    usuarioDB?: {
      id: string;
      nome: string;
      email: string;
      endereco: string | null;
      bairro: string | null;
      numero: number | null;
      cidade: string | null;
      telefone: string | null;
      CEP: string | null;
      UF: string | null;
      logoPath: string | null;
    };
  }
}
