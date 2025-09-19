import { Router } from "express";
import OrcamentoController from "../controllers/orcamentos.controller";
import { verificarToken } from "../middlewares/auth.middleware";

const router = Router();


router.post("/criar", verificarToken, OrcamentoController.criar);
router.get("/listar", verificarToken, OrcamentoController.listar);
router.get("/buscar/:id", verificarToken, OrcamentoController.buscarPorId);
router.put("/status/:id", verificarToken, OrcamentoController.atualizarStatus);
router.delete("/deletar/:id", verificarToken, OrcamentoController.deletar); // ← NOVA ROTA
router.get("/pdf/:id", verificarToken, OrcamentoController.gerarPDF);

// ← ROTA PARA LISTAR APENAS ITENS (se necessário)
// router.get("/itens", verificarToken, OrcamentoController.listItens);

/*
router.post("/criar", OrcamentoController.criar);
router.get("/listar", OrcamentoController.listar);
router.get("/buscar/:id", OrcamentoController.buscarPorId);  // ← NOVA ROTA
router.get("/listar-itens", OrcamentoController.listItens);
router.put("/atualizar-status/:id", OrcamentoController.atualizarStatus);
router.patch("/status/:id", OrcamentoController.atualizarStatus);  // ← ROTA ALTERNATIVA
router.get("/:id/pdf", OrcamentoController.gerarPDF);
*/

export default router;