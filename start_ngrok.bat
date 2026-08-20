@echo off
title SPOT THE ERRORS — Ngrok Public Tunnel (Port 5173)
color 0A

echo ======================================================================
echo          SPOT THE ERRORS — Public Internet Tunnel via Ngrok
echo ======================================================================
echo.
echo [INFO] This will create a secure public HTTPS link for your live game.
echo [INFO] Anyone on mobile data (4G/5G) or outside Wi-Fi can join.
echo.

set /p TOKEN="If this is your first time, paste your Ngrok Authtoken (or press Enter to skip): "

if not "%TOKEN%"=="" (
    echo [INFO] Setting authtoken...
    call npx ngrok config add-authtoken %TOKEN%
    echo.
)

echo [INFO] Starting Ngrok tunnel for http://localhost:5173 ...
echo.
echo ======================================================================
echo Copy the "Forwarding" HTTPS URL shown below and open it in your browser!
echo ======================================================================
echo.

call npx ngrok http 5173

pause
