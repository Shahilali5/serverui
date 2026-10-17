@echo off
setlocal enabledelayedexpansion
title ServerUI Launcher

echo ===================================================
echo           ServerUI - Windows Launcher
echo ===================================================
echo.

:: 1. Ensure .env exists
if not exist ".env" (
    echo [INFO] Creating .env from .env.example...
    copy ".env.example" ".env" >nul
)

:: 2. Ensure encryption key exists in .env
findstr /R "^SERVERUI_CREDENTIAL_ENCRYPTION_KEY=[a-fA-F0-9][a-fA-F0-9]*" ".env" >nul
if errorlevel 1 (
    echo [INFO] Generating AES-256-GCM encryption key...
    for /f %%a in ('powershell -Command "[BitConverter]::ToString((New-Object Byte[] 32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 })).Replace('-','').ToLower()"') do set "SECRET_KEY=%%a"
    powershell -Command "(Get-Content .env) -replace '^SERVERUI_CREDENTIAL_ENCRYPTION_KEY=.*', 'SERVERUI_CREDENTIAL_ENCRYPTION_KEY=!SECRET_KEY!' | Set-Content .env"
    echo [OK] Generated security encryption key in .env
)

:: 3. Check Docker status
echo [INFO] Checking Docker status...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker is running. Starting ServerUI containers...
    echo.
    docker compose -f deploy\docker\docker-compose.yml up -d --build
    if %errorlevel% equ 0 (
        echo.
        echo ===================================================
        echo   ServerUI is now running!
        echo   URL: http://localhost:3000
        echo ===================================================
        echo.
        start http://localhost:3000
        goto :done
    ) else (
        echo [WARN] Docker compose failed. Trying local dev mode...
    )
) else (
    echo [WARN] Docker Desktop is not running or not installed.
)

:: 4. Fallback: Local dev mode
echo.
echo Would you like to run the Web Desktop locally?
echo Make sure Node.js is installed.
echo.
choice /C YN /M "Start local Web Desktop (http://localhost:3000)"
if errorlevel 2 goto :done

cd apps\web
if not exist "node_modules" (
    echo [INFO] Installing web dependencies...
    call npm install
)
echo [INFO] Starting Next.js Web Desktop...
start http://localhost:3000
call npm run dev

:done
echo.
echo Press any key to exit...
pause >nul
