// src/middlewares/auth.middleware.ts

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
