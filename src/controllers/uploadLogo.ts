// src/controllers/uploadLogo.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";
import path from "path";
import fs from "fs";

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado." });
    }

    const logoPath = `/uploads/${req.file.filename}`;

    // Atualiza o campo no banco com o caminho da logo
    await prisma.usuario.update({
      where: { id: userId },
      data: { logoPath }
    });

    return res.status(200).json({ mensagem: "Logo enviada com sucesso.", caminho: logoPath });
  } catch (err) {
    console.error("Erro ao enviar logo:", err);
    return res.status(500).json({ erro: "Erro ao enviar logo." });
  }
};
