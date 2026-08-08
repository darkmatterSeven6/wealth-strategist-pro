@echo off
TITLE DV Financials Launcher
echo Starting DV Financials Full-Stack Services...

set "PATH=C:\Users\danie\nodejs;%PATH%"

:: Launch Express Backend on Port 5001 in a new window
start "DV Financials Backend (Port 5001)" cmd /k "cd /d "%~dp0backend" && set PATH=C:\Users\danie\nodejs;%%PATH%% && npm run dev"

:: Wait 2 seconds for backend initialization
timeout /t 2 /nobreak >nul

:: Launch Vite Frontend on Port 5173 in a new window
start "DV Financials Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && set PATH=C:\Users\danie\nodejs;%%PATH%% && npm run dev"

echo Both services launched successfully!
