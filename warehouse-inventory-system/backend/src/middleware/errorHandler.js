function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Conflict: Duplicate Entry',
      message: err.sqlMessage || 'A record with this unique value already exists.'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      error: 'Foreign Key Constraint Violation',
      message: err.sqlMessage || 'The requested operation violates relational integrity constraints.'
    });
  }

  // Stored Procedure Custom Errors (SQLSTATE 45000)
  if (err.sqlState === '45000') {
    return res.status(400).json({
      success: false,
      error: 'Database Business Rule Violation',
      message: err.sqlMessage || err.message
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected database or server error occurred.'
  });
}

module.exports = errorHandler;
