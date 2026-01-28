@echo off
setlocal enabledelayedexpansion

REM ============================
REM 📍 Rutas base
REM ============================
set BASEDIR=%~dp0
set UPDATE_DB=%BASEDIR%DDBB_UPDATE\app.db
set TARGET_DB=%BASEDIR%password-manager-local\data\app.db
set BACKUP_DIR=%BASEDIR%OLD_DDBB

REM ============================
REM ❌ Validaciones
REM ============================
if not exist "%UPDATE_DB%" (
    echo ❌ No existe DDBB_UPDATE\app.db
    pause
    exit /b 1
)

if not exist "%TARGET_DB%" (
    echo ❌ No existe password-manager-local\data\app.db
    pause
    exit /b 1
)

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

REM ============================
REM 🕒 Timestamp YYYYMMDD_HHMMSS
REM ============================
for /f "tokens=1-3 delims=/" %%a in ("%date%") do (
    set DD=%%a
    set MM=%%b
    set YYYY=%%c
)

for /f "tokens=1-3 delims=:" %%a in ("%time%") do (
    set HH=%%a
    set MN=%%b
    set SS=%%c
)

set HH=%HH: =0%
set TIMESTAMP=%YYYY%%MM%%DD%_%HH%%MN%%SS%

REM ============================
REM 💾 Backup
REM ============================
set BACKUP_FILE=%BACKUP_DIR%\app_%TIMESTAMP%.db

echo 📦 Creando backup:
echo    %BACKUP_FILE%
copy "%TARGET_DB%" "%BACKUP_FILE%" >nul

if errorlevel 1 (
    echo ❌ Error al crear el backup
    pause
    exit /b 1
)

REM ============================
REM 🔄 Reemplazo
REM ============================
echo 🔄 Reemplazando base de datos...
copy "%UPDATE_DB%" "%TARGET_DB%" >nul

if errorlevel 1 (
    echo ❌ Error al reemplazar la base de datos
    pause
    exit /b 1
)

echo ✅ Base de datos actualizada correctamente
echo 📂 Backup guardado en: OLD_DDBB
pause
