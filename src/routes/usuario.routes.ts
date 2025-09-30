// =============================================================================
// 5. ROTAS DE USUÁRIO ATUALIZADAS COM SINCRONIZAÇÃO
// src/routes/usuario.routes.ts
// =============================================================================

import { Router } from "express";
import usuarioController from "../controllers/usuario.controller";
import { verificarToken, logUserAction } from "../middlewares/auth.middleware";
import { ensureUserExists } from "../middlewares/ensureUser.middleware";
import { upload } from "../middlewares/multer";
import { uploadLogo } from "../controllers/uploadLogo";

const router = Router();

// ← ROTAS PÚBLICAS (sem autenticação)
router.post("/registrar", usuarioController.registrar);
router.post("/login", usuarioController.login);

// ← ROTAS PROTEGIDAS (com autenticação + sincronização)
// ✅ ORDEM IMPORTANTE: verificarToken → ensureUserExists → controller
router.get(
  "/perfil", 
  verificarToken, 
  ensureUserExists, // ✅ Garante usuário existe
  usuarioController.buscarPerfil
);

router.put(
  "/perfil", 
  verificarToken, 
  ensureUserExists, // ✅ Garante usuário existe
  logUserAction("UPDATE_PROFILE"), 
  usuarioController.atualizarPerfil
);

router.put(
  "/senha", 
  verificarToken, 
  ensureUserExists, // ✅ Garante usuário existe
  logUserAction("CHANGE_PASSWORD"), 
  usuarioController.alterarSenha
);

router.get(
  "/estatisticas", 
  verificarToken, 
  ensureUserExists, // ✅ Garante usuário existe
  usuarioController.estatisticasUsuario
);

// ← ROTAS DE UPLOAD (com autenticação + sincronização)
router.post(
  "/upload/avatar", 
  verificarToken, 
  ensureUserExists, // ✅ Garante usuário existe
  upload.single("avatar"),
  usuarioController.uploadAvatar
);

router.post(
  "/upload/logo", 
  verificarToken, 
  ensureUserExists, // ✅ Garante usuário existe
  upload.single("logo"),
  uploadLogo
);

// ← ROTA ADMINISTRATIVA (apenas para desenvolvimento)
// router.get("/listar", verificarToken, usuarioController.listar); // REMOVER EM PRODUÇÃO

export default router;
