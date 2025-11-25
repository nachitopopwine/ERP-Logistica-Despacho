import { Request, Response } from "express";
import pool from "../config/database";

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
export const procesarPedidoAutomatico = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = await pool.connect();

  try {
    const { id_venta } = req.body;

    if (!id_venta) {
      res.status(400).json({
        success: false,
        message: "El campo id_venta es requerido",
      });
      return;
    }

    console.log(
      `\n🤖 Iniciando procesamiento automático del pedido #${id_venta}...`
    );

    // Iniciar transacción
    await client.query("BEGIN");

    // ==================================================================
    // PASO 1: Obtener datos del pedido de venta
    // ==================================================================
    console.log("📦 Paso 1: Obteniendo datos del pedido...");

    const pedidoQuery = await client.query(
      `
      SELECT 
        v.id_venta,
        v.id_cliente,
        v.id_direccion,
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
    `,
      [id_venta]
    );

    if (pedidoQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({
        success: false,
        message: `Pedido de venta #${id_venta} no encontrado`,
      });
      return;
    }

    const pedido = pedidoQuery.rows[0];
    const numeroPedido = `PV-${String(pedido.id_venta).padStart(6, "0")}`;
    const clienteCompleto = `${pedido.cliente_nombre} ${
      pedido.cliente_apellido || ""
    }`.trim();

    console.log(`   ✅ Pedido: ${numeroPedido}`);
    console.log(`   ✅ Cliente: ${clienteCompleto}`);
    console.log(`   ✅ Dirección: ${pedido.direccion || "No especificada"}`);

    // Verificar que no exista ya una OT para este pedido
    const otExistente = await client.query(
      `
      SELECT id_ot 
      FROM "Logistica".log_ot_picking 
      WHERE observaciones LIKE $1
      LIMIT 1
    `,
      [`%${numeroPedido}%`]
    );

    if (otExistente.rows.length > 0) {
      await client.query("ROLLBACK");
      res.status(400).json({
        success: false,
        message: `Ya existe una OT para el pedido ${numeroPedido} (OT #${otExistente.rows[0].id_ot})`,
      });
      return;
    }

    // ==================================================================
    // PASO 2: Seleccionar empleado_logistica desde log_cuentas (balanceo por cont_asignaciones)
    // ==================================================================
    console.log(
      "\n👷 Paso 2: Seleccionando empleado_logistica desde log_cuentas..."
    );

    const empleadoCuentaQ = await client.query(`
      SELECT id, username, role, ref_id as id_empleado, cont_asignaciones
      FROM "Logistica".log_cuentas
      WHERE role = 'empleado_logistica'
      ORDER BY coalesce(cont_asignaciones,0) ASC, id ASC
      LIMIT 1
    `);

    if (empleadoCuentaQ.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(500).json({
        success: false,
        message: "No hay cuentas de empleado_logistica disponibles",
      });
      return;
    }

    const empleadoCuenta = empleadoCuentaQ.rows[0];
    console.log(
      `   ✅ Cuenta empleado seleccionada: ${empleadoCuenta.username} (empleado id ${empleadoCuenta.id_empleado}), asignaciones=${empleadoCuenta.cont_asignaciones}`
    );

    // Obtener datos legibles del empleado (nombre/apellido)
    const empleadoInfoQ = await client.query(
      `SELECT nombre, apellido FROM public.empleado WHERE id_empleado = $1 LIMIT 1`,
      [empleadoCuenta.id_empleado]
    );
    const empleadoInfo = empleadoInfoQ.rows[0] || { nombre: "", apellido: "" };

    // Incrementar contador de asignaciones en la cuenta
    await client.query(
      `
      UPDATE "Logistica".log_cuentas
      SET cont_asignaciones = coalesce(cont_asignaciones,0) + 1
      WHERE id = $1
    `,
      [empleadoCuenta.id]
    );

    // ==================================================================
    // PASO 3: Crear Orden de Trabajo automáticamente (estado 'En proceso')
    // ==================================================================
    console.log("\n📋 Paso 3: Creando Orden de Trabajo automáticamente...");

    const observacionesOT = `Pedido: ${numeroPedido} | Cliente: ${clienteCompleto} | Dirección: ${
      pedido.direccion || "No especificada"
    }`;

    const otResult = await client.query(
      `
      INSERT INTO "Logistica".log_ot_picking
        (id_empleado, fecha, estado, observaciones)
      VALUES ($1, CURRENT_TIMESTAMP, 'En proceso', $2)
      RETURNING *
    `,
      [empleadoCuenta.id_empleado, observacionesOT]
    );

    const nuevaOT = otResult.rows[0];
    console.log(
      `   ✅ OT #${nuevaOT.id_ot} creada (estado: ${nuevaOT.estado})`
    );

    // ==================================================================
    // PASO 4: Seleccionar transportista con menos pedidos_asignados
    // ==================================================================
    console.log(
      "\n🚚 Paso 4: Seleccionando transportista con menos pedidos_asignados..."
    );

    const transportistaQ = await client.query(`
      SELECT id_transportista, nombre, rut, pedidos_asignados
      FROM "Logistica".log_transportistas
      ORDER BY coalesce(pedidos_asignados,0) ASC, id_transportista ASC
      LIMIT 1
    `);

    if (transportistaQ.rows.length === 0) {
      await client.query("ROLLBACK");
      res
        .status(500)
        .json({ success: false, message: "No hay transportistas disponibles" });
      return;
    }

    const transportistaAsignado = transportistaQ.rows[0];
    console.log(
      `   ✅ Transportista asignado: ${transportistaAsignado.nombre} (pedidos_asignados=${transportistaAsignado.pedidos_asignados})`
    );

    // Incrementar contador de pedidos asignados en transportista
    await client.query(
      `
      UPDATE "Logistica".log_transportistas
      SET pedidos_asignados = coalesce(pedidos_asignados,0) + 1
      WHERE id_transportista = $1
    `,
      [transportistaAsignado.id_transportista]
    );

    // ==================================================================
    // PASO 5: Obtener dirección de entrega (etiqueta = 'casa') o fallback a cualquier dirección del cliente
    // ==================================================================
    console.log(
      "\n📦 Paso 5: Obteniendo dirección de entrega para el cliente..."
    );

    // Use the direccion referenced by the venta (id_direccion) as the delivery address
    let direccionEntrega: string | null = null;
    if (pedido.id_direccion) {
      const direccionByIdQ = await client.query(
        `SELECT * FROM public.direccion WHERE id_direccion = $1 LIMIT 1`,
        [pedido.id_direccion]
      );
      if (direccionByIdQ.rows.length > 0) {
        direccionEntrega = direccionByIdQ.rows[0].direccion || null;
      }
    }
    // Fallback: if venta had a direct direccion field use it
    if (!direccionEntrega && pedido.direccion)
      direccionEntrega = pedido.direccion;

    // ==================================================================
    // PASO 6: Crear Guía de Despacho automáticamente utilizando la OT creada
    // ==================================================================
    console.log("\n📦 Paso 6: Creando Guía de Despacho automáticamente...");

    // Create guia with undefined/null fecha so it can be set later when editing
    const guiaResult = await client.query(
      `
      INSERT INTO "Logistica".log_guia_despacho
        (id_ot, fecha, transportista, direccion_entrega)
      VALUES ($1, NULL, $2, $3)
      RETURNING *
    `,
      [nuevaOT.id_ot, transportistaAsignado.nombre, direccionEntrega]
    );

    const nuevaGuia = guiaResult.rows[0];
    console.log(`   ✅ Guía #${nuevaGuia.id_guia} creada exitosamente`);

    // ==================================================================
    // PASO 6: Actualizar estado en módulo de Ventas
    // ==================================================================
    console.log("\n📤 Paso 6: Actualizando estado en módulo de Ventas...");

    // TODO: Aquí podrías hacer una petición HTTP al módulo de Ventas
    // Por ahora, registramos en log que se debe notificar
    console.log(`   ⚠️  ACCIÓN REQUERIDA: Notificar a módulo de Ventas`);
    console.log(`   📝 ID Venta: ${id_venta}`);
    console.log(`   📝 Nuevo estado: "Enviado" o "Completado"`);
    console.log(`   📝 Guía de despacho: #${nuevaGuia.id_guia}`);

    // Commit de la transacción
    await client.query("COMMIT");

    console.log("\n✅ Procesamiento automático completado exitosamente\n");

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "Pedido procesado automáticamente",
      data: {
        pedido: {
          id_venta,
          numero: numeroPedido,
          cliente: clienteCompleto,
          direccion: pedido.direccion,
        },
        orden_trabajo: {
          id_ot: nuevaOT.id_ot,
          empleado: `${empleadoInfo.nombre} ${empleadoInfo.apellido}`,
          fecha: nuevaOT.fecha,
          estado: nuevaOT.estado,
        },
        guia_despacho: {
          id_guia: nuevaGuia.id_guia,
          transportista: transportistaAsignado.nombre,
          fecha: nuevaGuia.fecha,
          direccion: nuevaGuia.direccion_entrega,
        },
        notificacion_ventas: {
          pendiente: true,
          mensaje: 'Debe actualizar estado de venta a "Enviado" o "Completado"',
        },
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\n❌ Error en procesamiento automático:", error);

    res.status(500).json({
      success: false,
      message: "Error al procesar pedido automáticamente",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/automatizacion/estadisticas-balanceo
 * Ver estadísticas de balanceo de carga
 */
export const obtenerEstadisticasBalanceo = async (
  _req: Request,
  res: Response
): Promise<void> => {
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
        transportistas: transportistas.rows,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas de balanceo",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * PUT /api/automatizacion/ot/:id_ot
 * Edita una OT: permite cambiar el empleado asignado (id_empleado)
 * Body: { id_empleado: number }
 */
export const editarOt = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { id_ot } = req.params;
    const { id_empleado } = req.body;
    if (!id_ot || !id_empleado) {
      res.status(400).json({ success: false, message: "Faltan datos" });
      return;
    }

    await client.query("BEGIN");

    // Obtener OT actual
    const otQ = await client.query(
      `SELECT id_ot, id_empleado FROM "Logistica".log_ot_picking WHERE id_ot = $1 FOR UPDATE`,
      [id_ot]
    );
    if (otQ.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ success: false, message: "OT no encontrada" });
      return;
    }
    const ot = otQ.rows[0];

    // Buscar cuentas log_cuentas para los empleados viejo y nuevo
    const oldAccountQ = await client.query(
      `SELECT id FROM "Logistica".log_cuentas WHERE ref_id = $1 AND role = 'empleado_logistica' LIMIT 1`,
      [ot.id_empleado]
    );
    const newAccountQ = await client.query(
      `SELECT id FROM "Logistica".log_cuentas WHERE ref_id = $1 AND role = 'empleado_logistica' LIMIT 1`,
      [id_empleado]
    );

    // Actualizar OT
    await client.query(
      `UPDATE "Logistica".log_ot_picking SET id_empleado = $1 WHERE id_ot = $2`,
      [id_empleado, id_ot]
    );

    // Ajustar contadores si existen cuentas
    if (oldAccountQ.rows.length > 0) {
      await client.query(
        `UPDATE "Logistica".log_cuentas SET cont_asignaciones = GREATEST(coalesce(cont_asignaciones,0) - 1, 0) WHERE id = $1`,
        [oldAccountQ.rows[0].id]
      );
    }
    if (newAccountQ.rows.length > 0) {
      await client.query(
        `UPDATE "Logistica".log_cuentas SET cont_asignaciones = coalesce(cont_asignaciones,0) + 1 WHERE id = $1`,
        [newAccountQ.rows[0].id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "OT actualizada" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error editarOt", error);
    res.status(500).json({ success: false, message: "Error al editar OT" });
  } finally {
    client.release();
  }
};

/**
 * PUT /api/automatizacion/guia/:id_guia
 * Edita una guía de despacho: transportista, fecha, direccion_entrega
 * Body: { transportista?: string, fecha?: string, direccion_entrega?: string }
 */
export const editarGuia = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = await pool.connect();
  try {
    const { id_guia } = req.params;
    const { transportista, fecha, direccion_entrega } = req.body;
    if (!id_guia) {
      res.status(400).json({ success: false, message: "Faltan datos" });
      return;
    }

    await client.query("BEGIN");

    // Obtener guía actual
    const guiaQ = await client.query(
      `SELECT id_guia, transportista FROM "Logistica".log_guia_despacho WHERE id_guia = $1 FOR UPDATE`,
      [id_guia]
    );
    if (guiaQ.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ success: false, message: "Guía no encontrada" });
      return;
    }
    const guia = guiaQ.rows[0];

    // Si cambió transportista, ajustar contadores en log_transportistas
    if (transportista && transportista !== guia.transportista) {
      // Restar en antiguo transportista (si existe)
      await client.query(
        `UPDATE "Logistica".log_transportistas SET pedidos_asignados = GREATEST(coalesce(pedidos_asignados,0) - 1,0) WHERE nombre = $1`,
        [guia.transportista]
      );
      // Sumar en nuevo transportista (si existe)
      await client.query(
        `UPDATE "Logistica".log_transportistas SET pedidos_asignados = coalesce(pedidos_asignados,0) + 1 WHERE nombre = $1`,
        [transportista]
      );
    }

    // Construir update dinámico
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    if (transportista) {
      sets.push(`transportista = $${idx++}`);
      vals.push(transportista);
    }
    if (fecha) {
      sets.push(`fecha = $${idx++}`);
      vals.push(fecha);
    }
    if (direccion_entrega) {
      sets.push(`direccion_entrega = $${idx++}`);
      vals.push(direccion_entrega);
    }

    if (sets.length > 0) {
      const q = `UPDATE "Logistica".log_guia_despacho SET ${sets.join(
        ", "
      )} WHERE id_guia = $${idx}`;
      vals.push(id_guia);
      await client.query(q, vals);
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Guía actualizada" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error editarGuia", error);
    res.status(500).json({ success: false, message: "Error al editar guía" });
  } finally {
    client.release();
  }
};
