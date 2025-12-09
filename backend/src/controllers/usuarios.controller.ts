import { Request, Response } from "express";
import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";

/**
 * Login: Busca primero en public.empleado, luego en logistica.log_cuentas
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
      return;
    }

    /* 1. Buscar en public.empleado
    let userQuery = await pool.query(
      `SELECT id, rut, email, nombre, apellido, rol, password_hash 
       FROM public.empleado 
       WHERE email = $1 AND activo = true`,
      [email]
    );


    let user = userQuery.rows[0];
    let source = "public.empleado";

  /** */

    // 2. Si no existe, buscar en logistica.log_cuentas
    //if (!user) {
      let userQuery = await pool.query(
        `SELECT id, username, role, password_hash 
         FROM "Logistica".log_cuentas 
         WHERE username = $1`,
        [email]
      );
      let user = userQuery.rows[0];
      let source = "Logistica.log_cuentas";
    //}

    // 3. Usuario no encontrado en ninguna tabla
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // 4. Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // 5. Generar token simple (en producción usar JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString(
      "base64"
    );

    // 6. Retornar datos del usuario
    res.json({
      success: true,
      access_token: token,
      empleado: {
        id: user.id,
        rol: user.role,
        email: user.username,
        source, // Para debugging: de dónde viene el usuario
      },
    });
  } catch (error: any) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

/**
 * Registro: Crea usuario en logistica.log_cuentas
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rut, email, password, nombre, apellido, rol } = req.body;

    if (!rut || !email || !password || !nombre) {
      res.status(400).json({
        success: false,
        message: "RUT, email, contraseña y nombre son requeridos",
      });
      return;
    }

    // Verificar si ya existe en public.empleado
    const empleadoExiste = await pool.query(
      "SELECT id FROM public.empleado WHERE rut = $1 OR email = $2",
      [rut, email]
    );

    if (empleadoExiste.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "Ya existe un empleado con ese RUT o email",
      });
      return;
    }

    // Verificar si ya existe en logistica.log_cuentas
    const cuentaExiste = await pool.query(
      "SELECT id FROM logistica.log_cuentas WHERE rut = $1 OR email = $2",
      [rut, email]
    );

    if (cuentaExiste.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "Ya existe una cuenta con ese RUT o email",
      });
      return;
    }

    // Hash de contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar en logistica.log_cuentas
    const result = await pool.query(
      `INSERT INTO logistica.log_cuentas 
       (rut, email, password_hash, nombre, apellido, rol, activo)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, rut, email, nombre, apellido, rol`,
      [rut, email, password_hash, nombre, apellido || "", rol || "EMPLEADO_LOGISTICA"]
    );

    res.status(201).json({
      success: true,
      message: "Cuenta creada exitosamente",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error en register:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};