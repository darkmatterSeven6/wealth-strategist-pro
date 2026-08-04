@echo off
title FinFlow Pro Launcher
color 0B

echo ================================================================
echo        FinFlow Pro -- Philippine Wealth and Quant Hub
echo ================================================================
echo.

set APP_DIR=%~dp0
set PATH=C:\Users\danie\nodejs;%PATH%

echo [1/3] Checking Backend Services (Port 5001)...
netstat -ano | findstr ":5001" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo       Starting Backend Server in background...
    start "FinFlow Pro Backend" /min cmd /c "cd /d ""%APP_DIR%backend"" && set PATH=C:\Users\danie\nodejs;%PATH% && node server.js"
) else (
    echo       Backend is active on port 5001.
)

echo [2/3] Checking Frontend Dashboard (Port 5173)...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo       Starting Frontend Dev Server in background...
    start "FinFlow Pro Frontend" /min cmd /c "cd /d ""%APP_DIR%frontend"" && set PATH=C:\Users\danie\nodejs;%PATH% && npm.cmd run dev"
) else (
    echo       Frontend is active on port 5173.
)

echo [3/3] Opening FinFlow Pro Dashboard in Browser...
ping 127.0.0.1 -n 3 >nul
start http://localhost:5173

echo.
echo ================================================================
echo   FinFlow Pro is running at http://localhost:5173
echo   (You can close or minimize this prompt anytime)
echo ================================================================
ping 127.0.0.1 -n 3 >nul
exit
