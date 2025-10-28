import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Controlador para endpoints de integración con otros ERPs
 * Maneja la recepción de pedidos de ventas y órdenes de compra
 */

// ==================== PEDIDOS DE VENTAS ====================

/**
 * GET /api/integracion/pedidos-ventas
 * Lista todos los pedidos de ventas recibidos desde el ERP de Ventas
 * CONSULTA BD REAL: logistica.pedidos_ventas
 */
export const listarPedidosVentas = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        pv.id,
        pv.numero_pedido,
        pv.cliente,
        pv.direccion_despacho,
        pv.estado,
        pv.fecha_pedido,
        pv.fecha_recepcion,
        pv.observaciones,
        COUNT(dpv.id) as cantidad_productos
      FROM logistica.pedidos_ventas pv
      LEFT JOIN logistica.detalles_pedido_venta dpv ON pv.id = dpv.pedido_venta_id
      GROUP BY pv.id, pv.numero_pedido, pv.cliente, pv.direccion_despacho, 
               pv.estado, pv.fecha_pedido, pv.fecha_recepcion, pv.observaciones
      ORDER BY pv.fecha_recepcion DESC
    `;
    
    const result = await pool.query(query);
    
    console.log('✅ Pedidos de ventas encontrados:', result.rows.length);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error al listar pedidos de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos de ventas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * GET /api/integracion/pedidos-ventas/:id
 * Obtiene un pedido de venta específico con sus detalles
 */
export const obtenerPedidoVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener pedido
    const pedidoQuery = `
      SELECT * FROM logistica.pedidos_ventas WHERE id = $1
    `;
    const pedidoResult = await pool.query(pedidoQuery, [id]);
    
    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido de venta no encontrado'
      });
    }
    
    // Obtener detalles
    const detallesQuery = `
      SELECT * FROM logistica.detalles_pedido_venta WHERE pedido_venta_id = $1
    `;
    const detallesResult = await pool.query(detallesQuery, [id]);
    
    res.json({
      success: true,
      data: {
        ...pedidoResult.rows[0],
        detalles: detallesResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener pedido de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido de venta',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * POST /api/integracion/recibir-pedido-venta
 * Recibe un nuevo pedido desde el ERP de Ventas
 */
export const recibirPedidoVenta = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      numero_pedido,
      cliente,
      direccion_despacho,
      fecha_pedido,
      observaciones,
      detalles
    } = req.body;
    
    // Validar datos requeridos
    if (!numero_pedido || !cliente || !direccion_despacho || !detalles || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: numero_pedido, cliente, direccion_despacho y detalles'
      });
    }
    
    // Insertar pedido
    const pedidoQuery = `
      INSERT INTO logistica.pedidos_ventas 
        (numero_pedido, cliente, direccion_despacho, estado, fecha_pedido, fecha_recepcion, observaciones)
      VALUES ($1, $2, $3, 'PENDIENTE', $4, CURRENT_TIMESTAMP, $5)
      RETURNING *
    `;
    const pedidoResult = await client.query(pedidoQuery, [
      numero_pedido,
      cliente,
      direccion_despacho,
      fecha_pedido || new Date(),
      observaciones || null
    ]);
    
    const pedidoId = pedidoResult.rows[0].id;
    
    // Insertar detalles
    for (const detalle of detalles) {
      const detalleQuery = `
        INSERT INTO logistica.detalles_pedido_venta 
          (pedido_venta_id, producto_id, producto_nombre, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(detalleQuery, [
        pedidoId,
        detalle.producto_id,
        detalle.producto_nombre,
        detalle.cantidad,
        detalle.precio_unitario
      ]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Pedido de venta recibido correctamente',
      data: pedidoResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al recibir pedido de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recibir pedido de venta',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    client.release();
  }
};

// ==================== ÓRDENES DE COMPRA ====================

/**
 * GET /api/integracion/ordenes-compra
 * Lista todas las órdenes de compra recibidas desde el ERP de Compras
 * CONSULTA BD REAL: logistica.ordenes_compra
 */
export const listarOrdenesCompra = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        oc.id,
        oc.numero_orden,
        oc.proveedor,
        oc.estado,
        oc.fecha_orden,
        oc.fecha_recepcion,
        oc.fecha_esperada_entrega,
        oc.observaciones,
        COUNT(doc.id) as cantidad_productos
      FROM logistica.ordenes_compra oc
      LEFT JOIN logistica.detalles_orden_compra doc ON oc.id = doc.orden_compra_id
      GROUP BY oc.id, oc.numero_orden, oc.proveedor, oc.estado, 
               oc.fecha_orden, oc.fecha_recepcion, oc.fecha_esperada_entrega, oc.observaciones
      ORDER BY oc.fecha_recepcion DESC
    `;
    
    const result = await pool.query(query);
    
    console.log('✅ Órdenes de compra encontradas:', result.rows.length);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error al listar órdenes de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * GET /api/integracion/ordenes-compra/:id
 * Obtiene una orden de compra específica con sus detalles
 */
export const obtenerOrdenCompra = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener orden
    const ordenQuery = `
      SELECT * FROM logistica.ordenes_compra WHERE id = $1
    `;
    const ordenResult = await pool.query(ordenQuery, [id]);
    
    if (ordenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden de compra no encontrada'
      });
    }
    
    // Obtener detalles
    const detallesQuery = `
      SELECT * FROM logistica.detalles_orden_compra WHERE orden_compra_id = $1
    `;
    const detallesResult = await pool.query(detallesQuery, [id]);
    
    res.json({
      success: true,
      data: {
        ...ordenResult.rows[0],
        detalles: detallesResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener orden de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * POST /api/integracion/recibir-orden-compra
 * Recibe una nueva orden de compra desde el ERP de Compras
 */
export const recibirOrdenCompra = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      numero_orden,
      proveedor,
      fecha_orden,
      fecha_esperada_entrega,
      observaciones,
      detalles
    } = req.body;
    
    // Validar datos requeridos
    if (!numero_orden || !proveedor || !detalles || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: numero_orden, proveedor y detalles'
      });
    }
    
    // Insertar orden
    const ordenQuery = `
      INSERT INTO logistica.ordenes_compra 
        (numero_orden, proveedor, estado, fecha_orden, fecha_recepcion, fecha_esperada_entrega, observaciones)
      VALUES ($1, $2, 'PENDIENTE', $3, CURRENT_TIMESTAMP, $4, $5)
      RETURNING *
    `;
    const ordenResult = await client.query(ordenQuery, [
      numero_orden,
      proveedor,
      fecha_orden || new Date(),
      fecha_esperada_entrega || null,
      observaciones || null
    ]);
    
    const ordenId = ordenResult.rows[0].id;
    
    // Insertar detalles
    for (const detalle of detalles) {
      const detalleQuery = `
        INSERT INTO logistica.detalles_orden_compra 
          (orden_compra_id, producto_id, producto_nombre, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(detalleQuery, [
        ordenId,
        detalle.producto_id,
        detalle.producto_nombre,
        detalle.cantidad,
        detalle.precio_unitario
      ]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Orden de compra recibida correctamente',
      data: ordenResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al recibir orden de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recibir orden de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    client.release();
  }
};
