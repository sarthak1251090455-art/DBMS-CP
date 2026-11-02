const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDatabase() {
  console.log('Connecting to MySQL server...');
  
  // Connect without database first to ensure warehouse_db exists
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('Connected to MySQL. Reading schema.sql...');
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  const sqlContent = fs.readFileSync(schemaPath, 'utf8');

  console.log('Parsing and applying schema definitions...');

  // Parse SQL statements handling DELIMITER blocks for stored procedures
  const lines = sqlContent.split(/\r?\n/);
  const statements = [];
  let currentStatement = '';
  let currentDelimiter = ';';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for DELIMITER change
    if (line.toUpperCase().startsWith('DELIMITER ')) {
      currentDelimiter = line.substring(10).trim();
      continue;
    }

    if (line.startsWith('--') || line.length === 0) {
      continue;
    }

    currentStatement += lines[i] + '\n';

    if (currentDelimiter === ';' && line.endsWith(';')) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    } else if (currentDelimiter === '$$' && line.endsWith('$$')) {
      // Remove trailing $$
      const cleanStmt = currentStatement.trim().replace(/\$\$$/, '').trim();
      statements.push(cleanStmt);
      currentStatement = '';
    }
  }

  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim());
  }

  console.log(`Executing ${statements.length} DDL / SQL statements...`);

  for (let idx = 0; idx < statements.length; idx++) {
    const stmt = statements[idx];
    if (!stmt) continue;

    try {
      await connection.query(stmt);
    } catch (err) {
      console.error(`Error executing statement #${idx + 1}:`, err.message);
      console.error('Statement was:\n', stmt.substring(0, 150) + '...');
      throw err;
    }
  }

  console.log('Schema initialized successfully with all tables, views, procedures, and constraints!');
  await connection.end();
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
