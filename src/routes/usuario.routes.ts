// =============================================================================
// 5. ROTAS DE USUÁRIO ATUALIZADAS
// src/routes/usuario.routes.ts
// =============================================================================

import { Router } from "express";
import usuarioController from "../controllers/usuario.controller";
import { verificarToken, logUserAction } from "../middlewares/auth.middleware";

const router = Router();

// ← ROTAS PÚBLICAS (sem autenticação)
router.post("/registrar", usuarioController.registrar);
router.post("/login", usuarioController.login);

// ← ROTAS PROTEGIDAS (com autenticação)
router.get("/perfil", verificarToken, usuarioController.buscarPerfil);
router.put("/perfil", verificarToken, logUserAction("UPDATE_PROFILE"), usuarioController.atualizarPerfil);
router.put("/senha", verificarToken, logUserAction("CHANGE_PASSWORD"), usuarioController.alterarSenha);
router.get("/estatisticas", verificarToken, usuarioController.estatisticasUsuario);

// ← ROTAS DE UPLOAD (já existentes, mas com autenticação)
router.post("/upload/avatar", verificarToken, usuarioController.uploadAvatar);
router.post("/upload/logo", verificarToken, usuarioController.uploadLogo);

// ← ROTA ADMINISTRATIVA (apenas para desenvolvimento)
// router.get("/listar", verificarToken, usuarioController.listar); // REMOVER EM PRODUÇÃO

export default router;




/*
import { Router } from "express";
import UsuarioController from "../controllers/usuario.controller";
import { uploadLogo } from "../controllers/uploadLogo";
import { upload } from "../middlewares/multer";
import { verificarToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/registrar", UsuarioController.registrar);
router.post("/login", UsuarioController.login);
router.get("/listar", UsuarioController.uListar);
router.get("/buscar/:id", UsuarioController.buscarPorId);
router.post("/upload/logo", verificarToken, upload.single("logo"), uploadLogo);
router.get("/me", verificarToken, (UsuarioController as any).me);
router.put("/atualizar", verificarToken, (UsuarioController as any).atualizar);


export default router;
*/