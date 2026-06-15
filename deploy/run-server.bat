@echo off
REM ============================================
REM  CCTV Monitor - Web Server (auto-restart loop)
REM  Dipanggil oleh Task Scheduler saat PC nyala/login
REM ============================================
cd %~dp0\..

:loop
php artisan serve --host=0.0.0.0 --port=8123
echo [%date% %time%] Server berhenti, restart dalam 5 detik...
timeout /t 5 /nobreak >nul
goto loop
