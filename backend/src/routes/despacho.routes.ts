import { Router } from 'express';
import {
  getAllGuiasDespacho,
  getGuiaDespachoById,
  createGuiaDespacho
} from '../controllers/despacho.controller';

const router = Router();

/**
 * @route   GET /api/despacho
 * @desc    Obtener todas las guías de despacho
 * @access  Public
 */
router.get('/', getAllGuiasDespacho);

/**
 * @route   GET /api/despacho/:id
 * @desc    Obtener una guía de despacho específica
 * @access  Public
 */
router.get('/:id', getGuiaDespachoById);

/**
 * @route   POST /api/despacho
 * @desc    Crear nueva guía de despacho
 * @access  Public
 */
router.post('/', createGuiaDespacho);

export default router;
