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

const explorarBD = async () => {
  const client = await pool.connect();
  try {
    console.log('🔍 EXPLORANDO BASE DE DATOS COMPLETA\n');

    // 1. Listar todos los esquemas
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    console.log('📂 ESQUEMAS DISPONIBLES:');
    schemas.rows.forEach(s => console.log(`  - ${s.schema_name}`));

    // 2. Para cada esquema, listar tablas con conteo de registros
    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n\n📊 ESQUEMA: ${schemaName.toUpperCase()}`);
      console.log('='.repeat(80));

      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `, [schemaName]);

      if (tables.rows.length === 0) {
        console.log('  (Sin tablas)');
        continue;
      }

      for (const table of tables.rows) {
        const tableName = table.table_name;
        const fullName = `${schemaName}.${tableName}`;

        try {
          // Contar registros
          const count = await client.query(`SELECT COUNT(*) as total FROM ${fullName}`);
          const total = count.rows[0].total;

          // Obtener columnas
          const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2 
            ORDER BY ordinal_position
            LIMIT 10
          `, [schemaName, tableName]);

          console.log(`\n📋 Tabla: ${tableName}`);
          console.log(`   📊 Registros: ${total}`);
          console.log(`   📝 Columnas (primeras 10):`);
          columns.rows.forEach(col => {
            console.log(`      - ${col.column_name} (${col.data_type})`);
          });

          // Si tiene datos, mostrar un registro de ejemplo
          if (total > 0) {
            const sample = await client.query(`SELECT * FROM ${fullName} LIMIT 1`);
            console.log(`   📌 Ejemplo de registro:`);
            console.log(`      ${JSON.stringify(sample.rows[0], null, 2)}`);
          }

        } catch (err) {
          console.log(`   ❌ Error al consultar: ${err.message}`);
        }
      }
    }

    console.log('\n\n✅ EXPLORACIÓN COMPLETADA');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

explorarBD();
