import { Request, Response } from 'express';
import pool from '../config/database.js';

/**
 * Obtener todas las recepciones
 */
export const getAllRecepciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id_recepcion,
        r.id_proveedor,
        prov.nombre as nombre_proveedor,
        r.id_producto,
        prod.nombre as nombre_producto,
        r.cantidad,
        r.fecha,
        r.observaciones
      FROM log_recepcion r
      LEFT JOIN proveedores prov ON r.id_proveedor = prov.id_proveedor
      LEFT JOIN productos prod ON r.id_producto = prod.id_producto
      ORDER BY r.fecha DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener recepciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recepciones',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtener una recepción por ID
 */
export const getRecepcionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        r.id_recepcion,
        r.id_proveedor,
        prov.nombre as nombre_proveedor,
        r.id_producto,
        prod.nombre as nombre_producto,
        r.cantidad,
        r.fecha,
        r.observaciones
      FROM log_recepcion r
      LEFT JOIN proveedores prov ON r.id_proveedor = prov.id_proveedor
      LEFT JOIN productos prod ON r.id_producto = prod.id_producto
      WHERE r.id_recepcion = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Recepción no encontrada'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener recepción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recepción',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Registrar nueva recepción de mercadería
 */
export const createRecepcion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_proveedor, id_producto, cantidad, fecha, observaciones } = req.body;

    // Validación básica
    if (!id_proveedor || !id_producto || !cantidad || !fecha) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: id_proveedor, id_producto, cantidad y fecha son obligatorios'
      });
      return;
    }

    // Verificar que el proveedor existe
    const proveedorCheck = await pool.query(
      'SELECT id_proveedor FROM proveedores WHERE id_proveedor = $1',
      [id_proveedor]
    );

    if (proveedorCheck.rows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'El proveedor especificado no existe'
      });
      return;
    }

    // Verificar que el producto existe
    const productoCheck = await pool.query(
      'SELECT id_producto FROM productos WHERE id_producto = $1',
      [id_producto]
    );

    if (productoCheck.rows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'El producto especificado no existe'
      });
      return;
    }

    const result = await pool.query(`
      INSERT INTO log_recepcion (id_proveedor, id_producto, cantidad, fecha, observaciones)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id_proveedor, id_producto, cantidad, fecha, observaciones || null]);

    res.status(201).json({
      success: true,
      message: 'Recepción registrada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar recepción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar recepción',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
