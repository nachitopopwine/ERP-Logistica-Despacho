import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const crearTransportistas = async () => {
  const client = await pool.connect();
  try {
    console.log('🚚 Creando tabla de transportistas...\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS Logistica.transportistas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        rut VARCHAR(20),
        telefono VARCHAR(20),
        email VARCHAR(100),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla transportistas creada');

    await client.query(`
      INSERT INTO Logistica.transportistas (nombre, rut, telefono, email)
      VALUES 
        ('Transportes Rápidos S.A.', '76123456-7', '+56912345678', 'contacto@rapidos.cl'),
        ('LogiExpress Ltda.', '77234567-8', '+56923456789', 'info@logiexpress.cl'),
        ('Cargo Norte', '78345678-9', '+56934567890', 'ventas@cargonorte.cl'),
        ('Transportes del Sur', '79456789-0', '+56945678901', 'contacto@delsur.cl'),
        ('Express Delivery', '80567890-1', '+56956789012', 'info@express.cl')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Transportistas insertados\n');

    const result = await client.query('SELECT * FROM Logistica.transportistas');
    console.log('📋 Transportistas disponibles:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

crearTransportistas();
