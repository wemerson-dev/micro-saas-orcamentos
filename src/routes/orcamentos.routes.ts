import { Router } from "express";
import OrcamentoController from "../controllers/orcamentos.controller";

const router = Router();

router.post("/criar", OrcamentoController.criar);
router.get("/listar", OrcamentoController.listar);
router.get("/buscar/:id", OrcamentoController.buscarPorId);  // ← NOVA ROTA
router.get("/listar-itens", OrcamentoController.listItens);
router.put("/atualizar-status/:id", OrcamentoController.atualizarStatus);
router.patch("/status/:id", OrcamentoController.atualizarStatus);  // ← ROTA ALTERNATIVA
router.get("/:id/pdf", OrcamentoController.gerarPDF);

export default router;