import { Router } from "express";
import OrcamentoController from "../controllers/orcamentos.controller";

const router = Router();

router.post("/criar", OrcamentoController.criar);
router.get("/listar", OrcamentoController.listar);
router.put("/atualizar-status/:id", OrcamentoController.atualizarStatus);

export default router;