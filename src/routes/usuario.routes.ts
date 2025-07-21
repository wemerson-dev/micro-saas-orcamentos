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


export default router;