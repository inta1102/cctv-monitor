<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Level 1: Network monitoring - tiap 1 menit
Schedule::command('cctv:check-network')->everyMinute()->withoutOverlapping();

// Level 2: Service/port monitoring - tiap 2 menit
Schedule::command('cctv:check-service')->everyTwoMinutes()->withoutOverlapping();

// Level 3: Visual health check (snapshot) - tiap 5 menit
Schedule::command('cctv:check-visual')->everyFiveMinutes()->withoutOverlapping();
