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

        // selisih brightness per-pixel (0-255) di bawah ini dianggap "sama" antar snapshot
        'freeze_pixel_diff_threshold' => env('CCTV_FREEZE_PIXEL_DIFF_THRESHOLD', 2.0),

        // rasio pixel yang "sama" (di atas) antar snapshot berurutan untuk dianggap freeze
        'freeze_ratio_threshold' => env('CCTV_FREEZE_RATIO_THRESHOLD', 0.97),

        // standar deviasi brightness di bawah ini dianggap blank/no-signal (warna polos)
        'blank_stddev_threshold' => env('CCTV_BLANK_STDDEV_THRESHOLD', 2.0),
    ],
];
