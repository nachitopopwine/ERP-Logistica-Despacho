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

const crearTablasIntegracion = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Creando tablas de integración...\n');

    // Crear esquema si no existe
    await client.query(`CREATE SCHEMA IF NOT EXISTS Logistica`);
    console.log('✅ Esquema Logistica verificado/creado');

    // PEDIDOS DE VENTAS
    await client.query(`
      CREATE TABLE IF NOT EXISTS Logistica.pedidos_ventas (
        id SERIAL PRIMARY KEY,
        numero_pedido VARCHAR(50) NOT NULL UNIQUE,
        cliente VARCHAR(255) NOT NULL,
        direccion_despacho TEXT NOT NULL,
        estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PROCESADO', 'RECHAZADO')),
        fecha_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_recepcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla pedidos_ventas creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS Logistica.detalles_pedido_venta (
        id SERIAL PRIMARY KEY,
        pedido_venta_id INTEGER NOT NULL REFERENCES Logistica.pedidos_ventas(id) ON DELETE CASCADE,
        producto_id INTEGER,
        producto_nombre VARCHAR(255) NOT NULL,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla detalles_pedido_venta creada');

    // ÓRDENES DE COMPRA
    await client.query(`
      CREATE TABLE IF NOT EXISTS Logistica.ordenes_compra (
        id SERIAL PRIMARY KEY,
        numero_orden VARCHAR(50) NOT NULL UNIQUE,
        proveedor VARCHAR(255) NOT NULL,
        estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'RECEPCIONADA', 'RECHAZADA')),
        fecha_orden TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_recepcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_esperada_entrega TIMESTAMP,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla ordenes_compra creada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS Logistica.detalles_orden_compra (
        id SERIAL PRIMARY KEY,
        orden_compra_id INTEGER NOT NULL REFERENCES Logistica.ordenes_compra(id) ON DELETE CASCADE,
        producto_id INTEGER,
        producto_nombre VARCHAR(255) NOT NULL,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla detalles_orden_compra creada');

    // ÍNDICES
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_ventas_estado ON Logistica.pedidos_ventas(estado)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_ventas_fecha ON Logistica.pedidos_ventas(fecha_recepcion)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_detalles_pedido_venta_pedido ON Logistica.detalles_pedido_venta(pedido_venta_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ordenes_compra_estado ON Logistica.ordenes_compra(estado)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ordenes_compra_fecha ON Logistica.ordenes_compra(fecha_recepcion)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_detalles_orden_compra_orden ON Logistica.detalles_orden_compra(orden_compra_id)`);
    console.log('✅ Índices creados');

    // Insertar datos de prueba
    console.log('\n📝 Insertando datos de prueba...');
    
    // Pedido 1
    const pedido1 = await client.query(`
      INSERT INTO Logistica.pedidos_ventas 
        (numero_pedido, cliente, direccion_despacho, estado, fecha_pedido)
      VALUES 
        ('PV-2025-001', 'Cliente Demo S.A.', 'Av. Angamos 0610, Antofagasta', 'PENDIENTE', CURRENT_TIMESTAMP)
      ON CONFLICT (numero_pedido) DO NOTHING
      RETURNING id
    `);
    
    if (pedido1.rows.length > 0) {
      await client.query(`
        INSERT INTO Logistica.detalles_pedido_venta 
          (pedido_venta_id, producto_id, producto_nombre, cantidad, precio_unitario)
        VALUES 
          ($1, 1, 'Laptop HP 15', 2, 450000),
          ($1, 2, 'Mouse Logitech', 5, 15000)
      `, [pedido1.rows[0].id]);
      console.log('✅ Pedido de venta de prueba insertado');
    }

    // Orden de compra 1
    const orden1 = await client.query(`
      INSERT INTO Logistica.ordenes_compra 
        (numero_orden, proveedor, estado, fecha_orden, fecha_esperada_entrega)
      VALUES 
        ('OC-2025-001', 'Proveedor Tech LTDA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days')
      ON CONFLICT (numero_orden) DO NOTHING
      RETURNING id
    `);
    
    if (orden1.rows.length > 0) {
      await client.query(`
        INSERT INTO Logistica.detalles_orden_compra 
          (orden_compra_id, producto_id, producto_nombre, cantidad, precio_unitario)
        VALUES 
          ($1, 10, 'Monitor Samsung 24"', 10, 180000),
          ($1, 11, 'Teclado Mecánico', 15, 45000)
      `, [orden1.rows[0].id]);
      console.log('✅ Orden de compra de prueba insertada');
    }

    console.log('\n✨ ¡Tablas de integración creadas exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

crearTablasIntegracion();
