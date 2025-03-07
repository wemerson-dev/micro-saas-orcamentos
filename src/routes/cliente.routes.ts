import { Router } from "express";
import clienteController from "../controllers/cliente.controller";

const router = Router();

router.post("/criar", clienteController.criar);
router.get("/listar", clienteController.listar);
router.put("/atualizar/:id", clienteController.cUpdate);
router.delete("/deletar/:id", clienteController.cDelete);

export default router;