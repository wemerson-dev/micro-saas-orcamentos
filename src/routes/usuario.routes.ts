import { Router } from "express";
import UsuarioController from "../controllers/usuario.controller";

const router = Router();

router.post("/registrar", UsuarioController.registrar);
router.post("/login", UsuarioController.login);
router.get("/listar", UsuarioController.uListar);

export default router;