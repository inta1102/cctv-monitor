@echo off
REM ============================================
REM  CCTV Monitor - INSTALL (jalankan SEKALI saja)
REM  Jalankan dari folder root project: deploy\install.bat
REM ============================================
cd %~dp0\..

echo [1/6] Install dependency PHP (composer)...
composer install --no-dev --optimize-autoloader

echo [2/6] Copy .env (jika belum ada)...
if not exist .env (
    copy .env.example .env
)

echo [3/6] Generate APP_KEY (jika belum ada)...
php artisan key:generate

echo [4/6] Buat database SQLite (jika belum ada)...
if not exist database\database.sqlite (
    type nul > database\database.sqlite
)

echo [5/6] Jalankan migrasi database...
php artisan migrate --force

echo [6/6] Buat symlink storage (untuk snapshot)...
php artisan storage:link

echo.
echo ============================================
echo  INSTALL SELESAI.
echo  Langkah selanjutnya:
echo   1. Edit file .env - isi CCTV_TELEGRAM_BOT_TOKEN, CCTV_TELEGRAM_CHAT_ID, CCTV_FFMPEG_PATH
echo   2. Daftarkan device via web (Devices - Tambah Device)
echo   3. Setup Task Scheduler Windows dengan deploy\setup-scheduler.bat (run as Administrator)
echo ============================================
pause
