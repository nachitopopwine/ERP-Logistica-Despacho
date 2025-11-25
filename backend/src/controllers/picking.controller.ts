import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Obtener todas las órdenes de picking
 */
export const getAllOrdenesPicking = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        op.id_ot,
        op.id_empleado,
        e.nombre AS nombre_empleado,
        e.apellido AS apellido_empleado,
        op.fecha,
        op.estado,
        op.observaciones
      FROM "Logistica".log_ot_picking op
      LEFT JOIN public.empleado e ON op.id_empleado = e.id_empleado
      ORDER BY op.fecha DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener órdenes de picking:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener órdenes de picking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Obtener una orden de picking por ID
 */
export const getOrdenPickingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        op.id_ot,
        op.id_empleado,
        e.nombre AS nombre_empleado,
        e.apellido AS apellido_empleado,
        op.fecha,
        op.estado,
        op.observaciones
      FROM "Logistica".log_ot_picking op
      LEFT JOIN public.empleado e ON op.id_empleado = e.id_empleado
      WHERE op.id_ot = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Orden de picking no encontrada",
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener orden de picking:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener orden de picking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Crear nueva orden de picking
 */
export const createOrdenPicking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id_empleado, fecha, estado, observaciones } = req.body;

    if (!id_empleado || !fecha) {
      res.status(400).json({
        success: false,
        message:
          "Faltan campos requeridos: id_empleado y fecha son obligatorios",
      });
      return;
    }

    // Validar que el empleado existe
    const empleadoCheck = await pool.query(
      "SELECT id_empleado FROM public.empleado WHERE id_empleado = $1",
      [id_empleado]
    );

    if (empleadoCheck.rows.length === 0) {
      res.status(400).json({
        success: false,
        message: "El empleado especificado no existe",
      });
      return;
    }

    // Insertar la OT
    const result = await pool.query(
      `
      INSERT INTO "Logistica".log_ot_picking (id_empleado, fecha, estado, observaciones)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [id_empleado, fecha, estado || "Pendiente", observaciones || null]
    );

    res.status(201).json({
      success: true,
      message: "Orden de picking creada exitosamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear orden de picking:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear orden de picking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Actualizar orden de picking
 */
export const updateOrdenPicking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado, observaciones, fecha, id_empleado } = req.body;

    // Usamos transacción porque podemos necesitar ajustar contadores en log_cuentas
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Obtener OT actual for update
      const otQ = await client.query(
        `SELECT id_ot, id_empleado, fecha FROM "Logistica".log_ot_picking WHERE id_ot = $1 FOR UPDATE`,
        [id]
      );
      if (otQ.rows.length === 0) {
        await client.query("ROLLBACK");
        res
          .status(404)
          .json({ success: false, message: "Orden de picking no encontrada" });
        return;
      }

      const ot = otQ.rows[0];

      // Validación de fecha: si se envió una nueva fecha, no puede ser menor que la fecha actual registrada
      if (fecha) {
        const nuevaFecha = new Date(fecha);
        const fechaActual = new Date(ot.fecha);
        if (isNaN(nuevaFecha.getTime())) {
          await client.query("ROLLBACK");
          res.status(400).json({ success: false, message: "Fecha inválida" });
          return;
        }
        if (nuevaFecha < fechaActual) {
          await client.query("ROLLBACK");
          res
            .status(400)
            .json({
              success: false,
              message:
                "La nueva fecha no puede ser anterior a la fecha registrada",
            });
          return;
        }
      }

      // Si cambió el empleado, ajustar contadores en Logistica.log_cuentas (empleado_logistica)
      if (id_empleado && id_empleado !== ot.id_empleado) {
        const oldAccountQ = await client.query(
          `SELECT id FROM "Logistica".log_cuentas WHERE ref_id = $1 AND role = 'empleado_logistica' LIMIT 1`,
          [ot.id_empleado]
        );
        const newAccountQ = await client.query(
          `SELECT id FROM "Logistica".log_cuentas WHERE ref_id = $1 AND role = 'empleado_logistica' LIMIT 1`,
          [id_empleado]
        );

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
      }

      // Construir update dinámico
      const sets: string[] = [];
      const vals: any[] = [];
      let idx = 1;
      if (estado) {
        sets.push(`estado = $${idx++}`);
        vals.push(estado);
      }
      if (observaciones !== undefined) {
        sets.push(`observaciones = $${idx++}`);
        vals.push(observaciones);
      }
      if (fecha) {
        sets.push(`fecha = $${idx++}`);
        vals.push(fecha);
      }
      if (id_empleado) {
        sets.push(`id_empleado = $${idx++}`);
        vals.push(id_empleado);
      }

      if (sets.length > 0) {
        const q = `UPDATE "Logistica".log_ot_picking SET ${sets.join(
          ", "
        )} WHERE id_ot = $${idx} RETURNING *`;
        vals.push(id);
        const updateRes = await client.query(q, vals);
        await client.query("COMMIT");
        res.json({
          success: true,
          message: "Orden de picking actualizada exitosamente",
          data: updateRes.rows[0],
        });
        return;
      }

      // No hubo cambios
      await client.query("COMMIT");
      res.json({ success: true, message: "Sin cambios" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error al actualizar orden de picking:", err);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al actualizar orden de picking",
        });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error al actualizar orden de picking:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar orden de picking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
