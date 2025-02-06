import { Request, Response } from "express";
import prisma from "../prisma";
import bcscrit from "bcryptjs";
import jwt from "jsonwebtoken";


const UsuarioController = {
    async registrar(req: Request, res: Response) {
        try{
            const { nome, email, senha } = req.body;


            const usuario_existe = await prisma.usuario.findUnique({where: {email}});
            if (usuario_existe) 
                return res.status(400).json({erro: "Usuário já existe"});

            const senha_criptografada = await bcscrit.hash(senha, 10);

            const cria_usuario = await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    senha: senha_criptografada
                }
            });

            res.status(201).json(cria_usuario);   
        } catch (erro) {
            res.status(501).json({erro: "Erro ao criar usuário"});
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;

            const usuario = await prisma.usuario.findUnique({where: {email}});
            if (!usuario) 
                return res.status(400).json({erro: "Usuário não encontrado"});

            const senha_correta = await bcscrit.compare(senha, usuario.senha);
            if (!senha_correta) 
                return res.status(401).json({erro: "Senha incorreta"});

            const token = jwt.sign({id: usuario.id}, process.env.JWT_SECRET as string, {expiresIn: "1d"}); // 1d = 1 dia

            res.status(200).json({token, usuario});
        } catch (erro) {
            res.status(501).json({erro: "Erro ao fazer login"});
        }
    },
};

export default  UsuarioController ;