import { Router } from "express";
import {
  procesarPedidoAutomatico,
  obtenerEstadisticasBalanceo,
  editarOt,
  editarGuia,
} from "../controllers/automatizacion.controller";

const router = Router();

/**
 * POST /api/automatizacion/procesar-pedido
 * Procesa un pedido automáticamente: asigna empleado, crea OT, asigna transportista, crea guía
 */
router.post("/procesar-pedido", procesarPedidoAutomatico);

/**
 * GET /api/automatizacion/estadisticas-balanceo
 * Obtiene estadísticas de balanceo de carga de empleados y transportistas
 */
router.get("/estadisticas-balanceo", obtenerEstadisticasBalanceo);

// Edit OT and Guia
router.put("/ot/:id_ot", editarOt);
router.put("/guia/:id_guia", editarGuia);

export default router;
