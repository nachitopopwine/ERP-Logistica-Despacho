import { Router } from "express";
import {
  listarEmpleadosLogistica,
  registrarCuenta,
  login,
} from "../controllers/usuarios.controller";

const router = Router();

router.get("/empleados-logistica", listarEmpleadosLogistica);
router.post("/register", registrarCuenta);
router.post("/login", login);

export default router;
