-- Tabla para almacenar cuentas de acceso (empleados de logística y transportistas)
CREATE TABLE IF NOT EXISTS Logistica.log_cuentas (
  id SERIAL PRIMARY KEY,
  username VARCHAR(150) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('transportista','empleado_logistica')),
  ref_id INTEGER NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_log_cuentas_role ON Logistica.log_cuentas(role);
CREATE INDEX IF NOT EXISTS idx_log_cuentas_ref ON Logistica.log_cuentas(ref_id);
