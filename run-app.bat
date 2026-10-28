@echo off
setlocal enabledelayedexpansion
title Ecommerce & OMS Launcher

:: Navigate to script directory dynamically
cd /d "%~dp0"

echo ===================================================
echo   E-Commerce & Order Management System
echo ===================================================
echo.

:: 1. Launch Spring Boot Backend
echo [1/2] Starting Spring Boot Backend (Port 5432)...
start "Backend - Spring Boot" cmd /k "cd /d ""%~dp0src_back"" && .\mvnw.cmd spring-boot:run"

:: 2. Launch Frontend Server
echo [2/2] Starting Frontend Server (Port 8080)...
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "Frontend - Static Server" cmd /k "cd /d ""%~dp0src_front"" && py -m http.server 8080"
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        start "Frontend - Static Server" cmd /k "cd /d ""%~dp0src_front"" && python -m http.server 8080"
    ) else (
        where npx >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            start "Frontend - Static Server" cmd /k "cd /d ""%~dp0src_front"" && npx --yes serve -p 8080 ."
        ) else (
            echo [WARN] Neither Python nor Node/npx was found to serve static files.
            echo Please install Python, Node.js, or use VS Code Live Server.
        )
    )
)

echo.
echo ===================================================
echo   System is starting up!
echo.
echo   * Backend API:  http://localhost:5432
echo   * Frontend Web: http://localhost:8080/site.html
echo ===================================================
echo.
echo Press any key to open the website in your browser...
pause >nul
start http://localhost:8080/site.html
