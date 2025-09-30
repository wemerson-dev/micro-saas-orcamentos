import { Router } from "express";
import clienteController from "../controllers/cliente.controller";
import { verificarToken } from "../middlewares/auth.middleware";
import { ensureUserExists } from "../middlewares/ensureUser.middleware"; // ✅ ADICIONAR

const router = Router();

// ✅ Adicionar ensureUserExists em todas as rotas protegidas
router.post("/criar", verificarToken, ensureUserExists, clienteController.criar);
router.get("/listar", verificarToken, ensureUserExists, clienteController.listar);
router.get("/buscar/:id", verificarToken, ensureUserExists, clienteController.buscarPorId);
router.put("/atualizar/:id", verificarToken, ensureUserExists, clienteController.cUpdate);
router.delete("/deletar/:id", verificarToken, ensureUserExists, clienteController.cDelete);

export default router;
