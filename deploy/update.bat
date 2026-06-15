@echo off
REM ============================================
REM  CCTV Monitor - UPDATE (jalankan setiap ada update kode baru)
REM  Jalankan dari folder root project: deploy\update.bat
REM ============================================
cd %~dp0\..

echo [1/4] Ambil update kode terbaru dari Git...
git pull

echo [2/4] Update dependency PHP...
composer install --no-dev --optimize-autoloader

echo [3/4] Jalankan migrasi database (jika ada perubahan tabel)...
php artisan migrate --force

echo [4/4] Bersihkan cache...
php artisan config:clear
php artisan view:clear
php artisan cache:clear

echo.
echo ============================================
echo  UPDATE SELESAI.
echo ============================================
pause
