@echo off
title SPOT THE ERRORS — Instant Free Public Tunnel (No Signup)
color 0B

echo ======================================================================
echo          SPOT THE ERRORS — Free Public Tunnel (LocalTunnel)
echo                      "Zero Signup / Instant Public Link"
echo ======================================================================
echo.
echo [INFO] Starting instant public tunnel for http://localhost:5173 ...
echo.

call npx localtunnel --port 5173

pause
