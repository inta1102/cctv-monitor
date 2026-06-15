@echo off
REM ============================================
REM  CCTV Monitor - Setup Windows Task Scheduler
REM  WAJIB jalankan sebagai Administrator (klik kanan > Run as administrator)
REM  Jalankan SEKALI saja, atau setiap kali path project berubah.
REM ============================================

set PROJECT_DIR=%~dp0..
set PHP_PATH=php

echo Membuat task "CCTV-Checker" (jalan tiap menit, menjalankan cctv:check-*)...
schtasks /Create /TN "CCTV-Checker" /SC MINUTE /MO 1 ^
  /TR "\"%PHP_PATH%\" \"%PROJECT_DIR%\artisan\" schedule:run" ^
  /RU SYSTEM /RL HIGHEST /F

echo Membuat task "CCTV-WebServer" (jalan otomatis saat PC startup/login)...
schtasks /Create /TN "CCTV-WebServer" /SC ONSTART ^
  /TR "\"%PROJECT_DIR%\deploy\run-server.bat\"" ^
  /RU SYSTEM /RL HIGHEST /F

echo Membuat task "CCTV-QueueWorker" (jalan otomatis saat PC startup, proses notifikasi WA)...
schtasks /Create /TN "CCTV-QueueWorker" /SC ONSTART ^
  /TR "\"%PROJECT_DIR%\deploy\run-queue.bat\"" ^
  /RU SYSTEM /RL HIGHEST /F

echo.
echo ============================================
echo  SELESAI.
echo  - Task "CCTV-Checker"   : cek network/service/visual tiap menit (sesuai schedule di routes/console.php)
echo  - Task "CCTV-WebServer" : jalankan web dashboard di http://[IP-PC-ini]:8123
echo  - Task "CCTV-QueueWorker": proses notifikasi WhatsApp (queue: wa)
echo
echo  Cek status: buka "Task Scheduler" di Windows, lihat folder Task Scheduler Library.
echo  Untuk hapus: schtasks /Delete /TN "CCTV-Checker" /F ^&^& schtasks /Delete /TN "CCTV-WebServer" /F ^&^& schtasks /Delete /TN "CCTV-QueueWorker" /F
echo ============================================
pause
