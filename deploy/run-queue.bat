@echo off
REM ============================================
REM  CCTV Monitor - Queue Worker (auto-restart loop)
REM  Dipanggil oleh Task Scheduler saat PC nyala/login
REM  Memproses job WhatsApp alert (queue: wa, default)
REM ============================================
cd %~dp0\..

:loop
php artisan queue:work --queue=wa,default --tries=5 --sleep=3
echo [%date% %time%] Queue worker berhenti, restart dalam 5 detik...
timeout /t 5 /nobreak >nul
goto loop
