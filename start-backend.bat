@echo off
echo ===================================================
echo   STARTING DV FINANCIALS BACKEND (Port 5001)
echo ===================================================
cd /d "%~dp0\backend"
set PATH=C:\Users\danie\nodejs;%PATH%
node server.js
pause
