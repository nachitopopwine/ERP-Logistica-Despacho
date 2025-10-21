import { Router } from 'express';
import {
  getAllOrdenesPicking,
  getOrdenPickingById,
  createOrdenPicking,
  updateOrdenPicking
} from '../controllers/picking.controller.js';

const router = Router();

/**
 * @route   GET /api/picking
 * @desc    Obtener todas las órdenes de picking
 * @access  Public (después implementar autenticación)
 */
router.get('/', getAllOrdenesPicking);

/**
 * @route   GET /api/picking/:id
 * @desc    Obtener una orden de picking específica
 * @access  Public
 */
router.get('/:id', getOrdenPickingById);

/**
 * @route   POST /api/picking
 * @desc    Crear nueva orden de picking
 * @access  Public
 */
router.post('/', createOrdenPicking);

/**
 * @route   PUT /api/picking/:id
 * @desc    Actualizar orden de picking
 * @access  Public
 */
router.put('/:id', updateOrdenPicking);

export default router;
