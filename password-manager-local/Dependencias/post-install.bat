@echo off
setlocal enabledelayedexpansion

echo ================================
echo 🔧 Password Manager Local Setup
echo ================================

REM ============================
REM 📍 Ruta base
REM ============================
set BASEDIR=%~dp0
set PROJECT_DIR=%BASEDIR%..\password-manager-local

REM ============================
REM 🔍 Comprobar Node.js
REM ============================
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo 👉 Instala Node.js 20.20.0 desde:
    echo    https://nodejs.org/
    pause
    exit /b 1
)

REM ============================
REM 🔢 Comprobar versión Node
REM ============================
for /f "delims=v" %%i in ('node -v') do set NODE_VERSION=%%i

echo 🔎 Node detectado: v%NODE_VERSION%

if not "%NODE_VERSION%"=="20.20.0" (
    echo ❌ Versión incorrecta de Node.js
    echo 👉 Requerida: 20.20.0
    echo 👉 Detectada: %NODE_VERSION%
    pause
    exit /b 1
)

echo ✅ Node.js correcto

REM ============================
REM 📦 Comprobar / instalar pnpm
REM ============================
where pnpm >nul 2>&1
if errorlevel 1 (
    echo 📦 pnpm no encontrado, instalando...
    npm install -g pnpm
    if errorlevel 1 (
        echo ❌ Error instalando pnpm
        pause
        exit /b 1
    )
) else (
    echo ✅ pnpm ya está instalado
)

REM ============================
REM 📂 Entrar al proyecto
REM ============================
if not exist "%PROJECT_DIR%" (
    echo ❌ No se encuentra la carpeta password-manager-local
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"

REM ============================
REM 📥 Instalar dependencias
REM ============================
echo 📥 Instalando dependencias del proyecto...
pnpm install

if errorlevel 1 (
    echo ❌ Error durante pnpm install
    pause
    exit /b 1
)

echo ================================
echo ✅ Instalación completada con éxito
echo ================================
echo 👉 Ahora puedes ejecutar:
echo    pnpm tauri dev
pause