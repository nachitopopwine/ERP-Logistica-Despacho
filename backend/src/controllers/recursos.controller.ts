import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * GET /api/recursos/empleados
 * Lista todos los empleados activos
 * Consulta desde la tabla public.empleado que SÍ existe en BD compartida
 */
export const listarEmpleados = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        id_empleado as id,
        nombre,
        apellido,
        rol,
        email,
        telefono
      FROM public.empleado
      WHERE estado = 'ACTIVO'
      ORDER BY nombre, apellido
    `;
    
    const result = await pool.query(query);
    
    console.log('✅ Empleados encontrados:', result.rows.length);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error al listar empleados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleados',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * GET /api/recursos/transportistas
 * Lista todos los transportistas activos
 * CONSULTA BD REAL: logistica.transportistas
 */
export const listarTransportistas = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        id,
        nombre,
        rut,
        telefono,
        email
      FROM logistica.transportistas
      WHERE activo = true
      ORDER BY nombre
    `;
    
    const result = await pool.query(query);
    
    console.log('✅ Transportistas encontrados:', result.rows.length);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error al listar transportistas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener transportistas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
