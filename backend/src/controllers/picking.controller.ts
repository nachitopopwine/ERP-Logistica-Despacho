import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Obtener todas las órdenes de picking
 */
export const getAllOrdenesPicking = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        op.id_ot,
        op.id_empleado,
        e.nombre as nombre_empleado,
        op.fecha,
        op.estado,
        op.observaciones
      FROM log_ot_picking op
      LEFT JOIN empleados e ON op.id_empleado = e.id_empleado
      ORDER BY op.fecha DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener órdenes de picking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes de picking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtener una orden de picking por ID
 */
export const getOrdenPickingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        op.id_ot,
        op.id_empleado,
        e.nombre as nombre_empleado,
        op.fecha,
        op.estado,
        op.observaciones
      FROM log_ot_picking op
      LEFT JOIN empleados e ON op.id_empleado = e.id_empleado
      WHERE op.id_ot = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Orden de picking no encontrada'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener orden de picking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden de picking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Crear nueva orden de picking
 */
export const createOrdenPicking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_empleado, fecha, estado, observaciones } = req.body;

    // Validación básica
    if (!id_empleado || !fecha) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: id_empleado y fecha son obligatorios'
      });
      return;
    }

    // Verificar que el empleado existe
    const empleadoCheck = await pool.query(
      'SELECT id_empleado FROM empleados WHERE id_empleado = $1',
      [id_empleado]
    );

    if (empleadoCheck.rows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'El empleado especificado no existe'
      });
      return;
    }

    const result = await pool.query(`
      INSERT INTO log_ot_picking (id_empleado, fecha, estado, observaciones)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id_empleado, fecha, estado || 'PENDIENTE', observaciones || null]);

    res.status(201).json({
      success: true,
      message: 'Orden de picking creada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear orden de picking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear orden de picking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Actualizar orden de picking
 */
export const updateOrdenPicking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const result = await pool.query(`
      UPDATE log_ot_picking
      SET estado = COALESCE($1, estado),
          observaciones = COALESCE($2, observaciones)
      WHERE id_ot = $3
      RETURNING *
    `, [estado, observaciones, id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Orden de picking no encontrada'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Orden de picking actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar orden de picking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar orden de picking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
