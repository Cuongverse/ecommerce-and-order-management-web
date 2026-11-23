@echo off
setlocal enabledelayedexpansion
title Ecommerce & OMS Launcher

:: Navigate to script directory dynamically
cd /d "%~dp0"

echo ===================================================
echo   E-Commerce & Order Management System
echo ===================================================
echo.

:: 1. Launch Spring Boot Backend (keeps this CMD window open for backend logs)
echo [*] Starting Backend API on http://localhost:5432 ...
start "Backend - Spring Boot" cmd /k "cd /d ""%~dp0src_back"" && .\mvnw.cmd spring-boot:run"

:: 2. Directly open Frontend in default browser (no extra CMD window needed)
echo [*] Opening Frontend in your default browser...
set "backend_ready="
for /l %%i in (1,1,30) do (
    curl.exe -s --max-time 2 "http://localhost:5432/api/products?pageNumber=0&pageSize=1" >nul 2>&1
    if not errorlevel 1 (
        set "backend_ready=1"
        goto :frontend
    )
    timeout /t 1 >nul
)

:frontend
if defined backend_ready (
    start "" "%~dp0src_front\site.html"
) else (
    echo [!] Backend did not become ready within 30 seconds.
    echo [!] Check the "Backend - Spring Boot" window for MySQL or startup errors.
)

echo.
echo ===================================================
echo   System is starting up!
echo   * Backend:  http://localhost:5432
echo   * Frontend: Opened directly in browser
echo.
echo   Tip: Press Ctrl + F5 in browser to bypass cache!
echo ===================================================
echo.
timeout /t 5 >nul