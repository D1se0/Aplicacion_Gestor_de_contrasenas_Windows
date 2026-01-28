@echo off
REM Ir al directorio donde está este .bat
cd /d "%~dp0"

REM Ejecutar el script con Node
node run-dev.mjs

REM Mantener la ventana abierta si hay error
pause
