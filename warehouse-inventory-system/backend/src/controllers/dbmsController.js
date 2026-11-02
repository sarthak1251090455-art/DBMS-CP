const { query, getRecentQueries } = require('../config/db');

async function getTableStats(req, res, next) {
  try {
    const [tables] = await query(`
      SELECT 
        TABLE_NAME AS table_name,
        ENGINE AS engine,
        TABLE_ROWS AS estimated_rows,
        ROUND((DATA_LENGTH / 1024), 2) AS data_size_kb,
        ROUND((INDEX_LENGTH / 1024), 2) AS index_size_kb,
        TABLE_COLLATION AS collation,
        CREATE_TIME AS created_time
      FROM information_schema.tables
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY table_name ASC
    `);

    res.json({ success: true, count: tables.length, tables });
  } catch (error) {
    next(error);
  }
}

async function getTableSchema(req, res, next) {
  try {
    const { tableName } = req.params;
    const [columns] = await query(`
      SELECT 
        COLUMN_NAME AS column_name,
        COLUMN_TYPE AS column_type,
        IS_NULLABLE AS is_nullable,
        COLUMN_KEY AS column_key,
        COLUMN_DEFAULT AS column_default,
        EXTRA AS extra,
        COLUMN_COMMENT AS comment
      FROM information_schema.columns
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION ASC
    `, [tableName]);

    const [indexes] = await query(`
      SHOW INDEX FROM \`${tableName}\`
    `);

    res.json({ success: true, tableName, columns, indexes });
  } catch (error) {
    next(error);
  }
}

async function getForeignKeys(req, res, next) {
  try {
    const [fks] = await query(`
      SELECT 
        CONSTRAINT_NAME AS constraint_name,
        TABLE_NAME AS table_name,
        COLUMN_NAME AS column_name,
        REFERENCED_TABLE_NAME AS referenced_table,
        REFERENCED_COLUMN_NAME AS referenced_column
      FROM information_schema.key_column_usage
      WHERE TABLE_SCHEMA = DATABASE() 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY table_name, constraint_name
    `);

    res.json({ success: true, foreignKeys: fks });
  } catch (error) {
    next(error);
  }
}

async function getStoredProcedures(req, res, next) {
  try {
    const [routines] = await query(`
      SELECT 
        ROUTINE_NAME AS name,
        ROUTINE_TYPE AS type,
        DEFINER AS definer,
        CREATED AS created,
        LAST_ALTERED AS last_altered,
        ROUTINE_BODY AS body_type
      FROM information_schema.routines
      WHERE ROUTINE_SCHEMA = DATABASE()
      ORDER BY ROUTINE_NAME ASC
    `);

    res.json({ success: true, procedures: routines });
  } catch (error) {
    next(error);
  }
}

async function getViews(req, res, next) {
  try {
    const [views] = await query(`
      SELECT 
        TABLE_NAME AS view_name,
        VIEW_DEFINITION AS definition,
        CHECK_OPTION AS check_option,
        IS_UPDATABLE AS is_updatable
      FROM information_schema.views
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME ASC
    `);

    res.json({ success: true, views });
  } catch (error) {
    next(error);
  }
}

async function getQueryLog(req, res, next) {
  try {
    const logs = getRecentQueries();
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
}

async function explainQuery(req, res, next) {
  try {
    const { sql } = req.body;
    if (!sql || !sql.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(400).json({
        success: false,
        message: 'Only SELECT queries can be analyzed with EXPLAIN in this demonstration.'
      });
    }

    const [explainResult] = await query(`EXPLAIN ${sql}`);
    res.json({ success: true, sql, executionPlan: explainResult });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTableStats,
  getTableSchema,
  getForeignKeys,
  getStoredProcedures,
  getViews,
  getQueryLog,
  explainQuery
};
