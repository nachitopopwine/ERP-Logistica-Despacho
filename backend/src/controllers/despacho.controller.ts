import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Obtener todas las guías de despacho
 */
export const getAllGuiasDespacho = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        gd.id_guia,
        gd.id_ot,
        gd.fecha,
        gd.transportista,
        gd.direccion_entrega,
        op.estado as estado_ot
      FROM log_guia_despacho gd
      LEFT JOIN log_ot_picking op ON gd.id_ot = op.id_ot
      ORDER BY gd.fecha DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener guías de despacho:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener guías de despacho',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtener una guía de despacho por ID
 */
export const getGuiaDespachoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        gd.id_guia,
        gd.id_ot,
        gd.fecha,
        gd.transportista,
        gd.direccion_entrega,
        op.estado as estado_ot,
        op.id_empleado,
        e.nombre as nombre_empleado
      FROM log_guia_despacho gd
      LEFT JOIN log_ot_picking op ON gd.id_ot = op.id_ot
      LEFT JOIN empleados e ON op.id_empleado = e.id_empleado
      WHERE gd.id_guia = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Guía de despacho no encontrada'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener guía de despacho:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener guía de despacho',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Crear nueva guía de despacho
 * VALIDACIÓN: No permitir crear guía si la OT no existe
 */
export const createGuiaDespacho = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_ot, fecha, transportista, direccion_entrega } = req.body;

    // Validación básica
    if (!id_ot || !fecha || !transportista) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: id_ot, fecha y transportista son obligatorios'
      });
      return;
    }

    // ⚠️ VALIDACIÓN CRÍTICA: Verificar que la OT existe
    const otCheck = await pool.query(
      'SELECT id_ot, estado FROM log_ot_picking WHERE id_ot = $1',
      [id_ot]
    );

    if (otCheck.rows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se puede crear la guía de despacho: la Orden de Trabajo (OT) especificada no existe'
      });
      return;
    }

    // Validación adicional: La OT debe estar en estado que permita despacho
    const estadoOT = otCheck.rows[0].estado;
    if (estadoOT === 'CANCELADA') {
      res.status(400).json({
        success: false,
        message: 'No se puede crear guía de despacho para una OT cancelada'
      });
      return;
    }

    const result = await pool.query(`
      INSERT INTO log_guia_despacho (id_ot, fecha, transportista, direccion_entrega)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id_ot, fecha, transportista, direccion_entrega || null]);

    res.status(201).json({
      success: true,
      message: 'Guía de despacho creada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear guía de despacho:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear guía de despacho',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
