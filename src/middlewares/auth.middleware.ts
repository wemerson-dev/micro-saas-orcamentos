// src/middlewares/auth.middleware.ts

// =============================================================================
// 3. MIDDLEWARE DE AUTENTICAÇÃO MELHORADO
// src/middlewares/auth.middleware.ts
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { console } from "inspector";
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
    console.log(`token gerado: ${token}`)

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não configurado!");
      res.status(500).json({ 
        erro: "Configuração do servidor incorreta.",
        code: "SERVER_CONFIG_ERROR"
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // ← VALIDAR SE USUÁRIO AINDA EXISTE NO BANCO (OPCIONAL)
    // const usuario = await prisma.usuario.findUnique({
    //   where: { id: decoded.id },
    //   select: { id: true, nome: true, email: true }
    // });
    
    // if (!usuario) {
    //   res.status(401).json({ 
    //     erro: "Usuário não encontrado.",
    //     code: "USER_NOT_FOUND"
    //   });
    //   return;
    // }

    // Adicionar informações do usuário à requisição
    req.usuarioId = decoded.sub; // Usar 'sub' que é o ID do usuário do Supabase
    req.usuario = {
      id: decoded.sub, // Usar 'sub' para o ID
      nome: decoded.name || '', // Usar 'name' do user_metadata
      email: decoded.email || ''
    };

    console.log(`🔐 Usuário autenticado: ${decoded.sub}`);
    next();
    
  } catch (err: any) {
    console.error("Erro na verificação do token:", err);
    
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
      res.status(500).json({ 
        erro: "Erro interno do servidor.",
        code: "SERVER_ERROR"
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