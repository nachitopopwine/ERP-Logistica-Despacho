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

const verDatos = async () => {
  const client = await pool.connect();
  try {
    console.log('📊 DATOS DEL SISTEMA\n');

    // Empleados
    const empleados = await client.query('SELECT * FROM public.empleado ORDER BY id_empleado LIMIT 5');
    console.log('👥 EMPLEADOS:');
    console.table(empleados.rows);

    // Transportistas
    try {
      const transportistas = await client.query('SELECT * FROM Logistica.log_transportistas');
      console.log('\n🚚 TRANSPORTISTAS:');
      console.table(transportistas.rows);
    } catch (e) {
      console.log('\n🚚 TRANSPORTISTAS: (tabla no existe)');
    }

    // Pedidos
    const pedidos = await client.query('SELECT * FROM Logistica.pedidos_ventas');
    console.log('\n📦 PEDIDOS DE VENTA:');
    console.table(pedidos.rows);

    // Órdenes de compra
    const ordenes = await client.query('SELECT * FROM Logistica.ordenes_compra');
    console.log('\n📋 ÓRDENES DE COMPRA:');
    console.table(ordenes.rows);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

verDatos();
