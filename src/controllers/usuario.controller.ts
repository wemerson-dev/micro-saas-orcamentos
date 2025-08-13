import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { log } from "console";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

class UsuarioController  {
    //async registrar(req: Request, res: Response){
    static async registrar(req: Request, res: Response, next: Function): Promise<void> {
        try {
            const { nome, email, senha, endereco, bairro, cidade, CEP, numero, telefone, UF } = req.body;
      
            // Verifica se o usuário já existe
            const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
            if (usuarioExistente) {
                 res.status(400).json({ erro: "E-mail já cadastrado!" });
                 return;
            }
      
            // Criptografa a senha
            const senhaHash = await bcrypt.hash(senha, 10);
      
            // Cria o usuário
            const novoUsuario = await prisma.usuario.create({
              data: { nome, email, senha: senhaHash, endereco, bairro, cidade, CEP, numero, telefone, UF },
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
                if (!process.env.JWT_SECRET) {
                    res.status(500).json({ erro: "JWT_SECRET não definida no ambiente do servidor." });
                    return;
                }
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
    static async uListar(req: Request, res: Response): Promise<void> {
        try {
            const usuarios = await prisma.usuario.findMany();
            res.status(201).json(usuarios);
        } catch (error) {
            console.error("Erro ao listar usuários",error);
            res.status(500).json({ erro: "Erro ao listar usuários" });
        }
    }
    static async buscarPorId(req: Request, res: Response): Promise<void> {
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
                } // limitar o retorno
          });
      
          if (!usuario) {
            res.status(404).json({ erro: "Usuário não encontrado" });
            return;
          }
      
          res.json(usuario);
        } catch (error) {
          console.error("Erro ao buscar usuário:", error);
          res.status(500).json({ erro: "Erro ao buscar usuário" });
        }
      }
};

export default UsuarioController;

// Novos métodos
class _UsuarioControllerExt {}

(UsuarioController as any).me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.usuarioId;
        if (!usuarioId) {
            res.status(401).json({ erro: "Não autenticado" });
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
                cidade: true,
                CEP: true,
                numero: true,
                telefone: true,
                UF: true,
                logoPath: true,
            },
        });
        if (!usuario) {
            res.status(404).json({ erro: "Usuário não encontrado" });
            return;
        }
        res.json(usuario);
    } catch (error) {
        console.error("Erro ao obter perfil do usuário:", error);
        res.status(500).json({ erro: "Erro ao obter dados do usuário" });
    }
};

(UsuarioController as any).atualizar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.usuarioId;
        if (!usuarioId) {
            res.status(401).json({ erro: "Não autenticado" });
            return;
        }

        const {
            nome,
            email,
            senha,
            endereco,
            bairro,
            cidade,
            CEP,
            numero,
            telefone,
            UF,
        } = req.body as {
            nome?: string;
            email?: string;
            senha?: string;
            endereco?: string | null;
            bairro?: string | null;
            cidade?: string | null;
            CEP?: string | null;
            numero?: number | string | null;
            telefone?: string | null;
            UF?: string | null;
        };

        const dadosParaAtualizar: any = {};
        if (typeof nome !== "undefined") dadosParaAtualizar.nome = nome;
        if (typeof email !== "undefined") dadosParaAtualizar.email = email;
        if (typeof endereco !== "undefined") dadosParaAtualizar.endereco = endereco;
        if (typeof bairro !== "undefined") dadosParaAtualizar.bairro = bairro;
        if (typeof cidade !== "undefined") dadosParaAtualizar.cidade = cidade;
        if (typeof CEP !== "undefined") dadosParaAtualizar.CEP = CEP;
        if (typeof numero !== "undefined" && numero !== null && numero !== "") {
            const numeroInt = typeof numero === "string" ? parseInt(numero, 10) : numero;
            if (!Number.isNaN(numeroInt)) dadosParaAtualizar.numero = numeroInt;
        } else if (numero === null) {
            dadosParaAtualizar.numero = null;
        }
        if (typeof telefone !== "undefined") dadosParaAtualizar.telefone = telefone;
        if (typeof UF !== "undefined") dadosParaAtualizar.UF = UF;

        if (typeof senha !== "undefined" && senha) {
            const senhaHash = await bcrypt.hash(senha, 10);
            dadosParaAtualizar.senha = senhaHash;
        }

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: usuarioId },
            data: dadosParaAtualizar,
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
                UF: true,
                logoPath: true,
            },
        });

        res.json(usuarioAtualizado);
    } catch (error: any) {
        if (error?.code === "P2002") {
            res.status(400).json({ erro: "E-mail já está em uso" });
            return;
        }
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ erro: "Erro ao atualizar usuário" });
    }
};