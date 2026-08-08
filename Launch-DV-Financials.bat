@echo off
TITLE DV Financials Master Launcher
echo ===================================================
echo [DV FINANCIALS] Clearing stale processes & ports...
echo ===================================================

:: Ensure node and npm are accessible
set "PATH=C:\Users\danie\nodejs;%PATH%"

:: Clear any orphaned node instances to prevent port 5001/5173 lockouts
taskkill /F /IM node.exe >nul 2>&1

timeout /t 1 /nobreak >nul

echo [DV FINANCIALS] Starting Backend Service (Port 5001)...
start "DV Financials Backend" cmd /k "cd /d "%~dp0backend" && set PATH=C:\Users\danie\nodejs;%%PATH%% && npm run dev"

timeout /t 2 /nobreak >nul

echo [DV FINANCIALS] Starting Frontend Dashboard (Port 5173)...
start "DV Financials Frontend" cmd /k "cd /d "%~dp0frontend" && set PATH=C:\Users\danie\nodejs;%%PATH%% && npm run dev"

timeout /t 3 /nobreak >nul

echo [DV FINANCIALS] Opening Application in Google Chrome...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
) else (
    start "" "chrome.exe" "http://localhost:5173/" 2>nul || start http://localhost:5173/
)

echo ===================================================
echo DV FINANCIALS IS LIVE!
echo ===================================================
