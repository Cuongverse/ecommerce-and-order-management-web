@echo off
cd /d "D:\clone github\ecommerce-and-order-management-web"

start "Backend" cmd /k "cd /d D:\clone github\ecommerce-and-order-management-web\ecommerce && .\mvnw spring-boot:run"

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "Frontend" cmd /k "cd /d D:\clone github\ecommerce-and-order-management-web\src_front && py -m http.server 8080"
) else (
    start "Frontend" cmd /k "cd /d D:\clone github\ecommerce-and-order-management-web\src_front && python -m http.server 8080"
)

echo Backend: http://localhost:5432
echo Frontend: http://localhost:8080/site.html
pause
