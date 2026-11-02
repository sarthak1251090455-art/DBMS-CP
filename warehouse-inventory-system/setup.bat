@echo off
echo ===================================================
echo Warehouse ^& Inventory Management System - Setup
echo ===================================================
echo.

echo [1/3] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend npm install failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend npm install failed!
    pause
    exit /b %ERRORLEVEL%
)

cd ..
echo.
echo ===================================================
echo [SUCCESS] Dependencies installed!
echo.
echo Next steps:
echo 1. Ensure MySQL 8.0 is running.
echo 2. Run: cd backend ^&^& npm run db:init ^&^& npm run db:seed
echo 3. Double-click 'start-all.bat' to launch the system!
echo ===================================================
pause
