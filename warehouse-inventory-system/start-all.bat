@echo off
echo ===================================================
echo Starting Warehouse ^& Inventory Management System
echo ===================================================
echo.
echo Starting Backend API Server on http://localhost:5000 ...
start "Warehouse Backend (Port 5000)" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dev Server on http://localhost:5173 ...
start "Warehouse Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Application launching!
echo Frontend will be accessible at: http://localhost:5173
echo Backend API running at:         http://localhost:5000
echo ===================================================
