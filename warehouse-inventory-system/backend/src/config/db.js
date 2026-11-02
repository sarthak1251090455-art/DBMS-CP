const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'warehouse_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  multipleStatements: true,
  decimalNumbers: true
};

const pool = mysql.createPool(dbConfig);

// DBMS Query Logger for Academic Demonstration
const queryLogBuffer = [];
const MAX_LOG_ENTRIES = 50;

function logQuery(sql, params = [], durationMs = 0, error = null) {
  const entry = {
    id: Date.now() + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    sql: sql.trim().replace(/\s+/g, ' '),
    params,
    durationMs,
    status: error ? 'FAILED' : 'SUCCESS',
    errorMessage: error ? error.message : null
  };
  queryLogBuffer.unshift(entry);
  if (queryLogBuffer.length > MAX_LOG_ENTRIES) {
    queryLogBuffer.pop();
  }
}

// Wrapper for pool.query with telemetry
async function query(sql, params = []) {
  const start = performance.now();
  try {
    const [results, fields] = await pool.query(sql, params);
    const duration = +(performance.now() - start).toFixed(2);
    logQuery(sql, params, duration, null);
    return [results, fields];
  } catch (error) {
    const duration = +(performance.now() - start).toFixed(2);
    logQuery(sql, params, duration, error);
    throw error;
  }
}

// Transaction execution helper with automatic rollback on error
async function executeTransaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function getRecentQueries() {
  return queryLogBuffer;
}

module.exports = {
  pool,
  query,
  executeTransaction,
  getRecentQueries,
  dbConfig
};
