import { RequestHandler } from "express";
import prisma from "../prisma";

export const uploadLogo: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!req.file) {
      res.status(400).json({ erro: "Nenhum arquivo enviado." });
      return;
    }

    const logoPath = `/uploads/${req.file.filename}`;

    await prisma.usuario.update({
      where: { id: userId },
      data: { logoPath }
    });

    res.status(200).json({ mensagem: "Logo enviada com sucesso.", caminho: logoPath });
  } catch (err) {
    console.error("Erro ao enviar logo:", err);
    res.status(500).json({ erro: "Erro ao enviar logo." });
  }
};
