import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Controlador para endpoints de integración con otros ERPs
 * Maneja la recepción de pedidos de ventas y órdenes de compra
 */

// ==================== PEDIDOS DE VENTAS ====================

/**
 * GET /api/integracion/pedidos-ventas
 * Lista todos los pedidos de ventas DESDE EL MÓDULO DE VENTAS
 * CONSULTA BD REAL: Ventas.ventas + Ventas.detalle_venta
 * 
 * LÓGICA DE ESTADO:
 * - PENDIENTE: Pedidos que NO tienen una OT de Picking asignada
 * - PROCESADO: Pedidos que YA tienen una OT de Picking asignada
 */
export const listarPedidosVentas = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        v.id_venta as id,
        'PV-' || LPAD(v.id_venta::text, 6, '0') as numero_pedido,
        c.nombre || ' ' || c.apellido as cliente,
        c.direccion as direccion_despacho,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM "Logistica".log_ot_picking op 
            WHERE op.observaciones LIKE '%PV-' || LPAD(v.id_venta::text, 6, '0') || '%'
          ) THEN 'PROCESADO'
          ELSE 'PENDIENTE'
        END as estado,
        v.fecha_pedido,
        v.fecha_pedido as fecha_recepcion,
        'Forma de pago: ' || v.forma_de_pago || ' | Condiciones: ' || v.condiciones_de_pago as observaciones,
        COUNT(dv.id_producto) as cantidad_productos,
        v.total
      FROM "Ventas".ventas v
      INNER JOIN public.cliente c ON v.id_cliente = c.id_cliente
      LEFT JOIN "Ventas".detalle_venta dv ON v.id_venta = dv.id_venta
      GROUP BY v.id_venta, c.nombre, c.apellido, c.direccion, v.estado, 
               v.fecha_pedido, v.forma_de_pago, v.condiciones_de_pago, v.total
      ORDER BY v.fecha_pedido DESC
    `;
    
    const result = await pool.query(query);
    
    console.log('✅ Pedidos de ventas encontrados (desde Ventas):', result.rows.length);
    
    // Contar por estado
    const pendientes = result.rows.filter(r => r.estado === 'PENDIENTE').length;
    const procesados = result.rows.filter(r => r.estado === 'PROCESADO').length;
    console.log(`   📊 PENDIENTES: ${pendientes} | PROCESADOS: ${procesados}`);
    
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
 * Obtiene un pedido de venta específico con sus detalles DESDE VENTAS
 */
export const obtenerPedidoVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Obtener pedido con datos del cliente
    const pedidoQuery = `
      SELECT 
        v.id_venta as id,
        'PV-' || LPAD(v.id_venta::text, 6, '0') as numero_pedido,
        c.nombre || ' ' || c.apellido as cliente,
        c.direccion as direccion_despacho,
        CASE 
          WHEN v.estado = true THEN 'PROCESADO'
          ELSE 'PENDIENTE'
        END as estado,
        v.fecha_pedido,
        v.total,
        v.forma_de_pago,
        v.condiciones_de_pago
      FROM "Ventas".ventas v
      INNER JOIN public.cliente c ON v.id_cliente = c.id_cliente
      WHERE v.id_venta = $1
    `;
    const pedidoResult = await pool.query(pedidoQuery, [id]);
    
    if (pedidoResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Pedido de venta no encontrado'
      });
      return;
    }
    
    // Obtener detalles con nombre del producto
    const detallesQuery = `
      SELECT 
        dv.id_venta,
        dv.id_producto,
        p.nombre as producto_nombre,
        dv.cantidad,
        dv.precio_unitario,
        (dv.cantidad * dv.precio_unitario) as subtotal
      FROM "Ventas".detalle_venta dv
      INNER JOIN public.producto p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = $1
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
 * NOTA: Este endpoint ya no se usa, los datos vienen directamente de Ventas.ventas
 */
export const recibirPedidoVenta = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: numero_pedido, cliente, direccion_despacho y detalles'
      });
      return;
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
 * Lista todas las órdenes de compra DESDE EL MÓDULO DE COMPRAS
 * CONSULTA BD REAL: Compras.compras_oc + Compras.compras_detalle
 */
export const listarOrdenesCompra = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        oc.id_orden_compra as id,
        'OC-' || LPAD(oc.id_orden_compra::text, 6, '0') as numero_orden,
        prov.nombre as proveedor,
        CASE 
          WHEN oc.estado = 'Completada' THEN 'RECEPCIONADA'
          WHEN oc.estado = 'Cancelada' THEN 'RECHAZADA'
          ELSE 'PENDIENTE'
        END as estado,
        oc.fecha as fecha_orden,
        oc.fecha as fecha_recepcion,
        NULL as fecha_esperada_entrega,
        'Empleado: ' || COALESCE(e.nombre || ' ' || e.apellido, 'N/A') as observaciones,
        COUNT(cd.id_producto) as cantidad_productos
      FROM "Compras".compras_oc oc
      LEFT JOIN public.proveedor prov ON oc.id_proveedor = prov.id_proveedor
      LEFT JOIN public.empleado e ON oc.id_empleado = e.id_empleado
      LEFT JOIN "Compras".compras_detalle cd ON oc.id_orden_compra = cd.id_orden_compra
      GROUP BY oc.id_orden_compra, prov.nombre, oc.estado, oc.fecha, 
               e.nombre, e.apellido
      ORDER BY oc.fecha DESC
    `;
    
    const result = await pool.query(query);
    
    console.log('✅ Órdenes de compra encontradas (desde Compras):', result.rows.length);
    
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
 * Obtiene una orden de compra específica con sus detalles DESDE COMPRAS
 */
export const obtenerOrdenCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Obtener orden con datos del proveedor
    const ordenQuery = `
      SELECT 
        oc.id_orden_compra as id,
        'OC-' || LPAD(oc.id_orden_compra::text, 6, '0') as numero_orden,
        prov.nombre as proveedor,
        CASE 
          WHEN oc.estado = 'Completada' THEN 'RECEPCIONADA'
          WHEN oc.estado = 'Cancelada' THEN 'RECHAZADA'
          ELSE 'PENDIENTE'
        END as estado,
        oc.fecha as fecha_orden,
        oc.fecha as fecha_recepcion,
        e.nombre || ' ' || e.apellido as empleado
      FROM "Compras".compras_oc oc
      LEFT JOIN public.proveedor prov ON oc.id_proveedor = prov.id_proveedor
      LEFT JOIN public.empleado e ON oc.id_empleado = e.id_empleado
      WHERE oc.id_orden_compra = $1
    `;
    const ordenResult = await pool.query(ordenQuery, [id]);
    
    if (ordenResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Orden de compra no encontrada'
      });
      return;
    }
    
    // Obtener detalles con nombre del producto
    const detallesQuery = `
      SELECT 
        cd.id_detalle_compra as id,
        cd.id_producto,
        p.nombre as producto_nombre,
        cd.cantidad,
        cd.precio_unitario,
        cd.subtotal
      FROM "Compras".compras_detalle cd
      INNER JOIN public.producto p ON cd.id_producto = p.id_producto
      WHERE cd.id_orden_compra = $1
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
 * NOTA: Este endpoint ya no se usa, los datos vienen directamente de Compras.compras_oc
 */
export const recibirOrdenCompra = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: numero_orden, proveedor y detalles'
      });
      return;
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
