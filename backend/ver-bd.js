// Script para visualizar el contenido de la base de datos
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

async function verBaseDatos() {
  try {
    console.log('\n🔗 Conectando a Neon PostgreSQL...\n');
    
    // 1. Ver todos los esquemas
    console.log('📂 ========== ESQUEMAS DISPONIBLES ==========');
    const esquemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    esquemas.rows.forEach(row => {
      const emoji = row.schema_name === 'public' ? '🌐' : 
                    row.schema_name === 'Logistica' ? '🚚' : '📦';
      console.log(`   ${emoji} ${row.schema_name}`);
    });
    
    // 2. Ver tablas en PUBLIC
    console.log('\n🌐 ========== TABLAS EN ESQUEMA PUBLIC ==========');
    const tablasPublic = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    if (tablasPublic.rows.length === 0) {
      console.log('   ⚠️  No hay tablas en public');
    } else {
      tablasPublic.rows.forEach(row => {
        console.log(`   📋 ${row.table_name}`);
      });
    }
    
    // 3. Ver tablas en LOGISTICA
    console.log('\n🚚 ========== TABLAS EN ESQUEMA LOGISTICA ==========');
    const tablasLogistica = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'Logistica'
      ORDER BY table_name
    `);
    if (tablasLogistica.rows.length === 0) {
      console.log('   ⚠️  No hay tablas en Logistica');
    } else {
      tablasLogistica.rows.forEach(row => {
        console.log(`   📋 ${row.table_name}`);
      });
    }
    
    // 4. Ver TODAS las tablas de TODOS los esquemas
    console.log('\n📊 ========== RESUMEN GENERAL ==========');
    const todasTablas = await pool.query(`
      SELECT 
        table_schema as esquema,
        COUNT(*) as cantidad_tablas
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      GROUP BY table_schema
      ORDER BY table_schema
    `);
    todasTablas.rows.forEach(row => {
      console.log(`   ${row.esquema}: ${row.cantidad_tablas} tabla(s)`);
    });
    
    // 5. Ver si hay datos en empleado (tabla común)
    console.log('\n👥 ========== DATOS EN PUBLIC.EMPLEADO ==========');
    try {
      const empleados = await pool.query('SELECT COUNT(*) FROM public.empleado');
      console.log(`   Total empleados: ${empleados.rows[0].count}`);
      
      if (empleados.rows[0].count > 0) {
        const sample = await pool.query('SELECT id_empleado, nombre, apellido, cargo FROM public.empleado LIMIT 3');
        console.log('\n   Muestra (primeros 3):');
        sample.rows.forEach(emp => {
          console.log(`   - ID ${emp.id_empleado}: ${emp.nombre} ${emp.apellido} (${emp.cargo})`);
        });
      }
    } catch (error) {
      console.log('   ⚠️  Tabla empleado no existe');
    }
    
    console.log('\n✅ Exploración completada\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verBaseDatos();
