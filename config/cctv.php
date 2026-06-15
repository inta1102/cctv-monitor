<?php

return [

    'telegram' => [
        'bot_token' => env('CCTV_TELEGRAM_BOT_TOKEN'),
        'chat_id' => env('CCTV_TELEGRAM_CHAT_ID'),
    ],

    // Timeout untuk cek ping/port (detik)
    'check_timeout' => env('CCTV_CHECK_TIMEOUT', 3),

    // Path binary ffmpeg untuk ambil snapshot RTSP
    'ffmpeg_path' => env('CCTV_FFMPEG_PATH', 'ffmpeg'),

    // Threshold visual health check
    'visual' => [
        // rata-rata brightness (0-255) di bawah ini dianggap gelap total
        'dark_threshold' => env('CCTV_DARK_THRESHOLD', 12),

        // selisih rata-rata pixel antar snapshot berurutan di bawah ini dianggap freeze
        'freeze_diff_threshold' => env('CCTV_FREEZE_DIFF_THRESHOLD', 1.0),

        // standar deviasi brightness di bawah ini dianggap blank/no-signal (warna polos)
        'blank_stddev_threshold' => env('CCTV_BLANK_STDDEV_THRESHOLD', 2.0),
    ],
];
