const { Pool } = require('pg');

// Configuración de la base de datos
const dbConfig = {
  user: process.env.POSTGRES_USER || 'postgres.tlivzslgmjvfiufknhbd',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.DB_NAME || 'db_bestia',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.DB_PORT || 6543,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Crear el pool de conexiones
const pool = new Pool(dbConfig);

// Manejar eventos del pool
pool.on('connect', () => {
  console.log('🐘 Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  console.error('💥 Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    return false;
  }
};

// Función para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query ejecutada en ${duration}ms:`, text.substring(0, 50) + '...');
    return result;
  } catch (error) {
    console.error('💥 Error en query:', error.message);
    throw error;
  }
};

// Función para transacciones
const transaction = async (queries) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};