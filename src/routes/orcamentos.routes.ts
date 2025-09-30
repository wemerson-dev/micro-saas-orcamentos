import { Router } from "express";
import OrcamentoController from "../controllers/orcamentos.controller";
import { verificarToken } from "../middlewares/auth.middleware";
import { ensureUserExists } from "../middlewares/ensureUser.middleware"; // ✅ ADICIONAR

const router = Router();

// ✅ Adicionar ensureUserExists em todas as rotas protegidas
router.post("/criar", verificarToken, ensureUserExists, OrcamentoController.criar);
router.get("/listar", verificarToken, ensureUserExists, OrcamentoController.listar);
router.get("/buscar/:id", verificarToken, ensureUserExists, OrcamentoController.buscarPorId);
router.put("/status/:id", verificarToken, ensureUserExists, OrcamentoController.atualizarStatus);
router.delete("/deletar/:id", verificarToken, ensureUserExists, OrcamentoController.deletar);
router.get("/pdf/:id", verificarToken, ensureUserExists, OrcamentoController.gerarPDF);

export default router;
