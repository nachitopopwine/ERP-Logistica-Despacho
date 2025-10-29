import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * 🤖 PROCESAMIENTO AUTOMÁTICO DE PEDIDOS
 * 
 * Flujo completo automatizado:
 * 1. Recibe ID de venta del módulo de Ventas
 * 2. Asigna empleado con balanceo de carga
 * 3. Crea Orden de Trabajo automáticamente
 * 4. Asigna transportista con balanceo de carga  
 * 5. Crea Guía de Despacho automáticamente
 * 6. Notifica a Ventas para cambiar estado
 */

/**
 * POST /api/automatizacion/procesar-pedido
 * Procesa un pedido de venta automáticamente
 */
export const procesarPedidoAutomatico = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { id_venta } = req.body;

    if (!id_venta) {
      res.status(400).json({
        success: false,
        message: 'El campo id_venta es requerido'
      });
      return;
    }

    console.log(`\n🤖 Iniciando procesamiento automático del pedido #${id_venta}...`);

    // Iniciar transacción
    await client.query('BEGIN');

    // ==================================================================
    // PASO 1: Obtener datos del pedido de venta
    // ==================================================================
    console.log('📦 Paso 1: Obteniendo datos del pedido...');
    
    const pedidoQuery = await client.query(`
      SELECT 
        v.id_venta,
        v.id_cliente,
        v.fecha_pedido,
        v.total,
        v.estado as estado_venta,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.direccion,
        c.telefono,
        c.email
      FROM "Ventas".ventas v
      INNER JOIN public.cliente c ON v.id_cliente = c.id_cliente
      WHERE v.id_venta = $1
    `, [id_venta]);

    if (pedidoQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        message: `Pedido de venta #${id_venta} no encontrado`
      });
      return;
    }

    const pedido = pedidoQuery.rows[0];
    const numeroPedido = `PV-${String(pedido.id_venta).padStart(6, '0')}`;
    const clienteCompleto = `${pedido.cliente_nombre} ${pedido.cliente_apellido || ''}`.trim();
    
    console.log(`   ✅ Pedido: ${numeroPedido}`);
    console.log(`   ✅ Cliente: ${clienteCompleto}`);
    console.log(`   ✅ Dirección: ${pedido.direccion || 'No especificada'}`);

    // Verificar que no exista ya una OT para este pedido
    const otExistente = await client.query(`
      SELECT id_ot 
      FROM "Logistica".log_ot_picking 
      WHERE observaciones LIKE $1
      LIMIT 1
    `, [`%${numeroPedido}%`]);

    if (otExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        message: `Ya existe una OT para el pedido ${numeroPedido} (OT #${otExistente.rows[0].id_ot})`
      });
      return;
    }

    // ==================================================================
    // PASO 2: Asignar empleado con balanceo de carga
    // ==================================================================
    console.log('\n👷 Paso 2: Asignando empleado con balanceo de carga...');
    
    // TODO: Por ahora usar empleados con rol 'EMPLEADO'
    // Más adelante filtrar por rol 'Picking' o 'Operario'
    const empleadoQuery = await client.query(`
      SELECT 
        e.id_empleado,
        e.nombre,
        e.apellido,
        e.rol,
        COUNT(ot.id_ot) as carga_actual
      FROM public.empleado e
      LEFT JOIN "Logistica".log_ot_picking ot 
        ON e.id_empleado = ot.id_empleado 
        AND ot.estado IN ('Pendiente', 'En proceso')
      WHERE e.rol = 'EMPLEADO'
        AND e.estado = 'ACTIVO'
      GROUP BY e.id_empleado, e.nombre, e.apellido, e.rol
      ORDER BY carga_actual ASC, e.id_empleado ASC
      LIMIT 1
    `);

    if (empleadoQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: 'No hay empleados disponibles para asignar el pedido'
      });
      return;
    }

    const empleadoAsignado = empleadoQuery.rows[0];
    console.log(`   ✅ Empleado asignado: ${empleadoAsignado.nombre} ${empleadoAsignado.apellido}`);
    console.log(`   📊 Carga actual: ${empleadoAsignado.carga_actual} OT pendientes`);

    // ==================================================================
    // PASO 3: Crear Orden de Trabajo automáticamente
    // ==================================================================
    console.log('\n📋 Paso 3: Creando Orden de Trabajo...');
    
    const observacionesOT = `Pedido: ${numeroPedido} | Cliente: ${clienteCompleto} | Dirección: ${pedido.direccion || 'No especificada'}`;
    
    const otResult = await client.query(`
      INSERT INTO "Logistica".log_ot_picking 
        (id_empleado, fecha, estado, observaciones)
      VALUES ($1, CURRENT_TIMESTAMP, 'Pendiente', $2)
      RETURNING *
    `, [empleadoAsignado.id_empleado, observacionesOT]);

    const nuevaOT = otResult.rows[0];
    console.log(`   ✅ OT #${nuevaOT.id_ot} creada exitosamente`);

    // ==================================================================
    // PASO 4: Asignar transportista con balanceo de carga
    // ==================================================================
    console.log('\n🚚 Paso 4: Asignando transportista con balanceo de carga...');
    
    const transportistaQuery = await client.query(`
      SELECT 
        t.id_transportista,
        t.nombre,
        t.rut,
        COUNT(gd.id_guia) as entregas_activas
      FROM "Logistica".log_transportistas t
      LEFT JOIN "Logistica".log_guia_despacho gd 
        ON t.nombre = gd.transportista
      LEFT JOIN "Logistica".log_ot_picking ot 
        ON gd.id_ot = ot.id_ot
        AND ot.estado IN ('Pendiente', 'En proceso')
      GROUP BY t.id_transportista, t.nombre, t.rut
      ORDER BY entregas_activas ASC, t.id_transportista ASC
      LIMIT 1
    `);

    if (transportistaQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: 'No hay transportistas disponibles'
      });
      return;
    }

    const transportistaAsignado = transportistaQuery.rows[0];
    console.log(`   ✅ Transportista asignado: ${transportistaAsignado.nombre}`);
    console.log(`   📊 Entregas activas: ${transportistaAsignado.entregas_activas}`);

    // ==================================================================
    // PASO 5: Crear Guía de Despacho automáticamente
    // ==================================================================
    console.log('\n📦 Paso 5: Creando Guía de Despacho...');
    
    const guiaResult = await client.query(`
      INSERT INTO "Logistica".log_guia_despacho 
        (id_ot, fecha, transportista, direccion_entrega)
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
      RETURNING *
    `, [nuevaOT.id_ot, transportistaAsignado.nombre, pedido.direccion]);

    const nuevaGuia = guiaResult.rows[0];
    console.log(`   ✅ Guía #${nuevaGuia.id_guia} creada exitosamente`);

    // ==================================================================
    // PASO 6: Actualizar estado en módulo de Ventas
    // ==================================================================
    console.log('\n📤 Paso 6: Actualizando estado en módulo de Ventas...');
    
    // TODO: Aquí podrías hacer una petición HTTP al módulo de Ventas
    // Por ahora, registramos en log que se debe notificar
    console.log(`   ⚠️  ACCIÓN REQUERIDA: Notificar a módulo de Ventas`);
    console.log(`   📝 ID Venta: ${id_venta}`);
    console.log(`   📝 Nuevo estado: "Enviado" o "Completado"`);
    console.log(`   📝 Guía de despacho: #${nuevaGuia.id_guia}`);

    // Commit de la transacción
    await client.query('COMMIT');

    console.log('\n✅ Procesamiento automático completado exitosamente\n');

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Pedido procesado automáticamente',
      data: {
        pedido: {
          id_venta,
          numero: numeroPedido,
          cliente: clienteCompleto,
          direccion: pedido.direccion
        },
        orden_trabajo: {
          id_ot: nuevaOT.id_ot,
          empleado: `${empleadoAsignado.nombre} ${empleadoAsignado.apellido}`,
          fecha: nuevaOT.fecha,
          estado: nuevaOT.estado
        },
        guia_despacho: {
          id_guia: nuevaGuia.id_guia,
          transportista: transportistaAsignado.nombre,
          fecha: nuevaGuia.fecha,
          direccion: nuevaGuia.direccion_entrega
        },
        notificacion_ventas: {
          pendiente: true,
          mensaje: 'Debe actualizar estado de venta a "Enviado" o "Completado"'
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error en procesamiento automático:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al procesar pedido automáticamente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/automatizacion/estadisticas-balanceo
 * Ver estadísticas de balanceo de carga
 */
export const obtenerEstadisticasBalanceo = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Estadísticas de empleados
    const empleados = await pool.query(`
      SELECT 
        e.id_empleado,
        e.nombre,
        e.apellido,
        e.rol,
        COUNT(ot.id_ot) as ot_pendientes
      FROM public.empleado e
      LEFT JOIN "Logistica".log_ot_picking ot 
        ON e.id_empleado = ot.id_empleado 
        AND ot.estado IN ('Pendiente', 'En proceso')
      WHERE e.rol = 'EMPLEADO'
        AND e.estado = 'ACTIVO'
      GROUP BY e.id_empleado, e.nombre, e.apellido, e.rol
      ORDER BY ot_pendientes ASC
    `);

    // Estadísticas de transportistas
    const transportistas = await pool.query(`
      SELECT 
        t.id_transportista,
        t.nombre,
        COUNT(gd.id_guia) as entregas_activas
      FROM "Logistica".log_transportistas t
      LEFT JOIN "Logistica".log_guia_despacho gd 
        ON t.nombre = gd.transportista
      LEFT JOIN "Logistica".log_ot_picking ot 
        ON gd.id_ot = ot.id_ot
        AND ot.estado IN ('Pendiente', 'En proceso')
      GROUP BY t.id_transportista, t.nombre
      ORDER BY entregas_activas ASC
    `);

    res.json({
      success: true,
      data: {
        empleados: empleados.rows,
        transportistas: transportistas.rows
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de balanceo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
