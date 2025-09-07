import { Router } from "express";
import clienteController from "../controllers/cliente.controller";
import { verificarToken } from "../middlewares/auth.middleware"; // ← ADICIONAR


const router = Router();

router.post("/criar", verificarToken, clienteController.criar);
router.get("/listar", verificarToken, clienteController.listar);
router.put("/atualizar/:id", verificarToken, clienteController.cUpdate);
router.delete("/deletar/:id", verificarToken, clienteController.cDelete);

export default router;