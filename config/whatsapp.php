<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Global Switch
    |--------------------------------------------------------------------------
    | Master ON/OFF WhatsApp notification
    */
    'enabled' => env('WA_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Driver
    |--------------------------------------------------------------------------
    | log    : hanya log ke laravel.log (DEV / testing)
    | qontak : kirim via Qontak WhatsApp API
    */
    'driver' => env('WA_DRIVER', 'log'), // log | qontak

    /*
    |--------------------------------------------------------------------------
    | Default Templates
    |--------------------------------------------------------------------------
    */
    'defaults' => [
        'language' => 'id',

        // template universal (5 variable) - sama seperti CRMS
        'ticket_template' => 'ticket_notify_any',
    ],

    /*
    |--------------------------------------------------------------------------
    | Penerima Alert CCTV
    |--------------------------------------------------------------------------
    | Daftar nomor WA (08xx/62xx) yang akan menerima notifikasi alert CCTV.
    | Pisahkan dengan koma di .env, contoh:
    | CCTV_WA_NUMBERS=081234567890,081298765432,081211112222
    */
    'recipients' => [
        'cctv_numbers' => array_filter(array_map(
            'trim',
            explode(',', env('CCTV_WA_NUMBERS', ''))
        )),
    ],

    /*
    |--------------------------------------------------------------------------
    | Qontak Configuration
    |--------------------------------------------------------------------------
    */
    'qontak' => [
        'base_url'   => env('QONTAK_BASE', ''),
        'api_token'  => env('QONTAK_TOKEN', ''),
        'channel_id' => env('QONTAK_CHANNEL_ID', null),

        'endpoint_send_template' => env(
            'QONTAK_ENDPOINT_SEND_TEMPLATE',
            'whatsapp/send-template'
        ),

        'templates' => [
            'ticket_notify_any' => env('QONTAK_TMP_TICKET_NOTIFY'),
        ],
    ],

];
