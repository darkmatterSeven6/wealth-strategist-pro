@echo off
echo ===================================================
echo   STARTING FINFLOW PRO BACKEND (Port 5001)
echo ===================================================
cd /d "%~dp0\backend"
set PATH=C:\Users\danie\nodejs;%PATH%
node server.js
pause
