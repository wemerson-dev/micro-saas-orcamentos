import { Router } from "express";
import clienteController from "../controllers/cliente.controller";

const router = Router();

router.post("/criar", clienteController.criar);
router.get("/listar", clienteController.listar);

export default router;