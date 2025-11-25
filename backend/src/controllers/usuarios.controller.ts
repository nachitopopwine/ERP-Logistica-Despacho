import { Request, Response } from "express";
import pool from "../config/database";
import bcrypt from "bcryptjs";

/**
 * GET /api/usuarios/empleados-logistica
 * Lista empleados con rol 'EMPLEADO_LOGISTICA' desde public.empleado
 */
export const listarEmpleadosLogistica = async (
  _req: Request,
  res: Response
) => {
  try {
    const query = `
      SELECT id_empleado as id, nombre, apellido, rol, email
      FROM public.empleado
      WHERE rol = 'EMPLEADO_LOGISTICA' AND estado = 'ACTIVO'
      ORDER BY nombre, apellido
    `;

    console.log("Executing query to list empleados logistica", query);

    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error listarEmpleadosLogistica", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener empleados de logística",
    });
  }
};

/**
 * POST /api/usuarios/register
 * Registra una cuenta vinculada a un empleado_logistica o transportista
 * body: { role: 'transportista'|'empleado_logistica', ref_id: number, username?: string, password: string }
 */
export const registrarCuenta = async (req: Request, res: Response) => {
  const { role, ref_id, username, password } = req.body;

  if (!role || !ref_id || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Faltan datos obligatorios" });
  }

  // Determine default username when not provided
  let finalUsername = username;
  try {
    if (!finalUsername) {
      if (role === "empleado_logistica") {
        const r = await pool.query(
          "SELECT email FROM public.empleado WHERE id_empleado = $1",
          [ref_id]
        );
        finalUsername = r.rows[0]?.email || `empleado_${ref_id}`;
      } else if (role === "transportista") {
        const r = await pool.query(
          'SELECT email, nombre FROM "Logistica".log_transportistas WHERE id_transportista = $1',
          [ref_id]
        );
        finalUsername = r.rows[0]?.email || `trans_${ref_id}`;
      } else if (role === "jefe_logistica") {
        const r = await pool.query(
          "SELECT email FROM public.empleado WHERE id_empleado = $1",
          [ref_id]
        );
        finalUsername = r.rows[0]?.email || `jefe_${ref_id}`;
      }
    }

    // Check if username already exists
    const exist = await pool.query(
      'SELECT id FROM "Logistica".log_cuentas WHERE username = $1',
      [finalUsername]
    );
    if ((exist?.rowCount ?? 0) > 0) {
      return res
        .status(409)
        .json({ success: false, message: "El nombre de usuario ya existe" });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Insert account
    const insertQ = `
      INSERT INTO "Logistica".log_cuentas (username, role, ref_id, password_hash, created_at)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, role, ref_id, created_at
    `;
    const inserted = await pool.query(insertQ, [
      finalUsername,
      role,
      ref_id,
      hash,
    ]);

    res.status(201).json({ success: true, data: inserted.rows[0] });
  } catch (error) {
    console.error("Error registrarCuenta", error);
    res
      .status(500)
      .json({ success: false, message: "Error al crear la cuenta" });
  }
};

/**
 * POST /api/usuarios/login
 * body: { username, password }
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Faltan credenciales" });

  try {
    const q =
      'SELECT id, username, role, ref_id, password_hash FROM "Logistica".log_cuentas WHERE username = $1';
    const result = await pool.query(q, [username]);
    if (result.rowCount === 0)
      return res
        .status(401)
        .json({ success: false, message: "Credenciales inválidas" });

    const account = result.rows[0];
    const match = bcrypt.compareSync(password, account.password_hash);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Credenciales inválidas" });

    // Update last_login
    await pool.query(
      'UPDATE "Logistica".log_cuentas SET last_login = NOW() WHERE id = $1',
      [account.id]
    );

    // Return minimal account info (do not send hash)
    res.json({
      success: true,
      data: {
        id: account.id,
        username: account.username,
        role: account.role,
        ref_id: account.ref_id,
      },
    });
  } catch (error) {
    console.error("Error login", error);
    res.status(500).json({ success: false, message: "Error interno en login" });
  }
};
