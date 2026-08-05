@echo off
echo ===================================================
echo   STARTING DV FINANCIALS FRONTEND (Port 5173)
echo ===================================================
cd /d "%~dp0\frontend"
set PATH=C:\Users\danie\nodejs;%PATH%
npm.cmd run dev
pause
