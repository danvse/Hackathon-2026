@echo off
title Mercedes-Benz Parts Pulse - Full Stack Controller
echo =====================================================================
echo   MERCEDES-BENZ PARTS PULSE - FULL STACK CONTROLLER
echo   VIN Decoder, Web Price Hunter & Historical Price Intelligence
echo =====================================================================
echo.
echo [1/2] Starting Background Price Hunter & Automation API Server (Port 5000)...
start "Parts Pulse API Server" cmd /k "C:\Users\Dan\AppData\Local\Python\bin\python.exe api_server.py"

echo [2/2] Launching Angular Web Dashboard (Port 4200)...
cd car-parts-dashboard
npm start
pause
