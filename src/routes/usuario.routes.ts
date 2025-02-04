import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";


const router = Router();

router.post("/registrar", UsuarioController.registrar);
router.post("/login", UsuarioController.login);


export default router;