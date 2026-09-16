@echo off
echo ========================================================
echo Starting React + Vite Frontend on http://127.0.0.1:5173
echo ========================================================
cd /d "%~dp0frontend"
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
pause
