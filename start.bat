@echo off
title SPOT THE ERRORS — Live Multiplayer Platform
color 0B

echo ======================================================================
echo          SPOT THE ERRORS - Live Multiplayer Competition Platform
echo               "Eyes Sharp. Mind Fast. Become the Champion."
echo ======================================================================
echo.

cd /d "%~dp0"

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing dependencies...
    call npm run install:all
    if %errorlevel% neq 0 (
        echo [ERROR] Dependency installation failed!
        pause
        exit /b 1
    )
)

echo [INFO] Starting Backend Server (Port 5000) and Web Client (Port 5173)...
echo [INFO] Organizer Dashboard: http://localhost:5173
echo [INFO] Backend API:        http://localhost:5000/api
echo.
echo ======================================================================
echo Opening the web application in your default browser...
echo (Press Ctrl+C in this window anytime to stop the server)
echo ======================================================================
echo.

:: Automatically open the website after 3 seconds in background
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"

:: Run the dev server
call npm run dev

pause
