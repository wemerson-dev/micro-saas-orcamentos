// src/middlewares/auth.middleware.ts

// =============================================================================
// 3. MIDDLEWARE DE AUTENTICAÇÃO MELHORADO
// src/middlewares/auth.middleware.ts
// =============================================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  usuarioId?: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
}

interface JWTPayload {
  sub: string; // ID do usuário no Supabase
  email?: string;
  name?: string; // Propriedade 'name' no user_metadata do Supabase
}

export const verificarToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ 
        erro: "Token não fornecido. Acesso negado.",
        code: "NO_TOKEN"
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log(`🔍 Token recebido (primeiros 50 chars): ${token.substring(0, 50)}...`);

    // Tentar decodificar como token do Supabase primeiro
    try {
      // Tokens do Supabase são JWTs mas com estrutura diferente
      const decoded = JSON.parse(atob(token.split('.')[1])) as any;
      console.log(`🔍 Token decodificado:`, decoded);
      
      // Se tem 'sub', é um token do Supabase
      if (decoded.sub) {
        req.usuarioId = decoded.sub;
        req.usuario = {
          id: decoded.sub,
          nome: decoded.user_metadata?.name || decoded.name || '',
          email: decoded.email || ''
        };
        console.log(`🔐 Usuário autenticado via Supabase: ${decoded.sub}`);
        next();
        return;
      }
      
      // Se tem 'id', é um token do sistema antigo
      if (decoded.id) {
        req.usuarioId = decoded.id;
        req.usuario = {
          id: decoded.id,
          nome: decoded.nome || '',
          email: decoded.email || ''
        };
        console.log(`🔐 Usuário autenticado via sistema antigo: ${decoded.id}`);
        next();
        return;
      }
      
      throw new Error('Token sem identificador válido');
      
    } catch (decodeError) {
      console.log(`⚠️ Falha ao decodificar token como Supabase, tentando JWT_SECRET...`);
      
      // Fallback: tentar com JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET não configurado!");
        res.status(500).json({ 
          erro: "Configuração do servidor incorreta.",
          code: "SERVER_CONFIG_ERROR"
        });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      
      req.usuarioId = decoded.id || decoded.sub;
      req.usuario = {
        id: decoded.id || decoded.sub,
        nome: decoded.nome || decoded.name || '',
        email: decoded.email || ''
      };

      console.log(`🔐 Usuário autenticado via JWT_SECRET: ${req.usuarioId}`);
      next();
    }
    
  } catch (err: any) {
    console.error("❌ Erro na verificação do token:", err.message);
    
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        erro: "Token inválido.",
        code: "INVALID_TOKEN"
      });
    } else if (err.name === 'TokenExpiredError') {
      res.status(401).json({ 
        erro: "Token expirado. Faça login novamente.",
        code: "EXPIRED_TOKEN"
      });
    } else {
      res.status(401).json({ 
        erro: "Falha na autenticação.",
        code: "AUTH_FAILED"
      });
    }
  }
};

// ← MIDDLEWARE ADICIONAL PARA LOGS DE AUDITORIA
export const logUserAction = (action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.usuarioId;
    const timestamp = new Date().toISOString();
    
    console.log(`📝 AUDIT LOG [${timestamp}] - User: ${userId} - Action: ${action} - IP: ${req.ip}`);
    
    // ← AQUI VOCÊ PODE SALVAR NO BANCO SE QUISER
    // await prisma.auditLog.create({
    //   data: {
    //     userId,
    //     action,
    //     ip: req.ip,
    //     userAgent: req.headers['user-agent'],
    //     timestamp: new Date()
    //   }
    // });
    
    next();
  };
};



/*
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  usuarioId?: string; // adicionamos o ID do usuário aqui
}

export const verificarToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ erro: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ erro: "JWT_SECRET não configurado no ambiente." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    req.usuarioId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};
*/