import { Router } from 'express';
import {
  getAllRecepciones,
  getRecepcionById,
  createRecepcion
} from '../controllers/recepcion.controller';

const router = Router();

/**
 * @route   GET /api/recepcion
 * @desc    Obtener todas las recepciones
 * @access  Public
 */
router.get('/', getAllRecepciones);

/**
 * @route   GET /api/recepcion/:id
 * @desc    Obtener una recepción específica
 * @access  Public
 */
router.get('/:id', getRecepcionById);

/**
 * @route   POST /api/recepcion
 * @desc    Registrar nueva recepción de mercadería
 * @access  Public
 */
router.post('/', createRecepcion);

export default router;
