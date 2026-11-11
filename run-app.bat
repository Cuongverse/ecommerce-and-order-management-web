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
start "" "%~dp0src_front\site.html"

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