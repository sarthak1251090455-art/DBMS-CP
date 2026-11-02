const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedDatabase() {
  console.log('Connecting to MySQL database to seed data...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'warehouse_db',
    multipleStatements: true
  });

  const seedPath = path.join(__dirname, '../../../database/seed.sql');
  const sqlContent = fs.readFileSync(seedPath, 'utf8');

  console.log('Executing seed.sql batch script...');
  await connection.query(sqlContent);

  console.log('Seed data inserted successfully!');
  await connection.end();
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
