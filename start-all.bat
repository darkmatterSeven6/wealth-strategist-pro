@echo off
echo ================================================================
echo   🚀 LAUNCHING DV FINANCIALS (FULL-STACK LOCAL WEALTH HUB)
echo ================================================================
echo Starting Backend Server on http://localhost:5001 ...
start "DV Financials Backend" cmd /k "cd /d %~dp0\backend && set PATH=C:\Users\danie\nodejs;%PATH% && node server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend Dashboard on http://localhost:5173 ...
start "DV Financials Frontend" cmd /k "cd /d %~dp0\frontend && set PATH=C:\Users\danie\nodejs;%PATH% && npm.cmd run dev"

echo.
echo Both services launched! 
echo Open your browser to: http://localhost:5173
echo.
