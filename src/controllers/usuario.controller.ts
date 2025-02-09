import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class UsuarioController  {
    //async registrar(req: Request, res: Response){
    static async registrar(req: Request, res: Response, next: Function): Promise<void> {
        try {
            const { nome, email, senha } = req.body;
      
            // Verifica se o usuário já existe
            const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
            if (usuarioExistente) 
                 res.status(400).json({ erro: "E-mail já cadastrado!" });
      
            // Criptografa a senha
            const senhaHash = await bcrypt.hash(senha, 10);
      
            // Cria o usuário
            const novoUsuario = await prisma.usuario.create({
              data: { nome, email, senha: senhaHash },
            });
      
            res.status(201).json(novoUsuario);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao registrar usuário" });
        }
    }

    static async login(req: Request, res: Response, next: Function): Promise<void> {
        try {
            const { email, senha } = req.body;
    
            // Verifica se o usuário existe
            const usuario = await prisma.usuario.findUnique({ where: { email } });
            if (!usuario) {
                res.status(400).json({ erro: "Usuário não encontrado!" });
                return;
            }   
    
            // Verifica se a senha está correta
            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
            if (!senhaCorreta){
                res.status(400).json({ erro: "Senha incorreta!" });
                return;
            } else{
                // Gera o token JWT
                const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET as string, { expiresIn: "8h" });
                console.log("Token gerado" , token);
                res.json({ token, usuario });
            return;}

        } catch (error) {
            console.error("Erro ao fazer o login",error);
            res.status(500).json({ erro: "Erro ao fazer login" });
            return 
        }
    }
};
export default UsuarioController;