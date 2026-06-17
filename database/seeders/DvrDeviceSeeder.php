<?php

namespace Database\Seeders;

use App\Models\Device;
use Illuminate\Database\Seeder;

/**
 * Seeder untuk DVR Hikvision MSA 1 & MSA 2.
 *
 * DVR MSA 1 - IP: 200.16.1.53  (Camera 01-16, IP Camera 01, Lift, IP Camera 02)
 * DVR MSA 2 - IP: 200.16.1.249 (Camera 01-16)
 *
 * ISAPI Snapshot URL format:
 *   Analog  : http://[ip]/ISAPI/Streaming/channels/[N*100+1]/picture  (Camera N)
 *   IP Cam  : http://[ip]/ISAPI/Streaming/channels/[17xx]/picture
 *
 * Sebelum jalankan seeder ini, pastikan:
 *   1. php artisan migrate sudah dijalankan
 *   2. Sesuaikan USERNAME & PASSWORD di bawah jika berbeda
 *   3. Jalankan: php artisan db:seed --class=DvrDeviceSeeder
 *
 * CATATAN: Seeder ini menggunakan updateOrCreate berdasarkan (name + ip_address)
 * sehingga aman dijalankan berulang kali (tidak duplikat).
 */
class DvrDeviceSeeder extends Seeder
{
    // =========================================================
    // KONFIGURASI - Sesuaikan jika perlu
    // =========================================================
    const DVR1_IP       = '200.16.1.53';
    const DVR1_USER     = 'admin';
    const DVR1_PASS     = 'MSAdvr1234';
    const DVR1_LOCATION = 'Server01';

    const DVR2_IP       = '200.16.1.249';
    const DVR2_USER     = 'admin';
    const DVR2_PASS     = 'admin1234'; // Ganti jika password berbeda
    const DVR2_LOCATION = 'Server02';
    // =========================================================

    public function run(): void
    {
        $this->seedDvr1();
        $this->seedDvr2();

        $this->command->info('DvrDeviceSeeder selesai.');
    }

    private function seedDvr1(): void
    {
        $ip   = self::DVR1_IP;
        $user = self::DVR1_USER;
        $pass = self::DVR1_PASS;
        $loc  = self::DVR1_LOCATION;

        // ---- DVR unit ----
        $this->upsert([
            'name'              => 'DVR MSA 1',
            'type'              => 'dvr',
            'ip_address'        => $ip,
            'location'          => $loc,
            'web_port'          => 80,
            'rtsp_port'         => 554,
            'snapshot_enabled'  => false,
            'snapshot_username' => $user,
            'snapshot_password' => $pass,
            'is_active'         => true,
            'notes'             => 'Hikvision Embedded Net DVR 16ch',
        ]);

        // ---- Analog Camera 01–16 (Camera 15 offline, nonaktifkan) ----
        for ($n = 1; $n <= 16; $n++) {
            $channel = ($n * 100) + 1; // 101, 201, ..., 1601
            $offline = ($n === 15);    // Camera 15 diketahui offline

            $this->upsert([
                'name'              => 'DVR MSA 1 CAM ' . str_pad($n, 2, '0', STR_PAD_LEFT),
                'type'              => 'camera',
                'ip_address'        => $ip,
                'location'          => $loc,
                'web_port'          => 80,
                'rtsp_port'         => 554,
                'rtsp_path'         => '/Streaming/Channels/' . $channel,
                'snapshot_url'      => "http://{$ip}/ISAPI/Streaming/channels/{$channel}/picture",
                'snapshot_enabled'  => !$offline,
                'snapshot_username' => $user,
                'snapshot_password' => $pass,
                'is_active'         => !$offline,
                'notes'             => $offline ? 'Camera 15 - offline/tidak terpasang' : "Analog channel {$n} DVR MSA 1",
            ]);
        }

        // ---- IP Camera yang terhubung ke DVR MSA 1 ----
        $ipCams = [
            ['name' => 'DVR MSA 1 IP CAM 01', 'channel' => 1701, 'notes' => 'IP Camera 01 via DVR MSA 1'],
            ['name' => 'DVR MSA 1 LIFT',       'channel' => 1801, 'notes' => 'Lift Camera via DVR MSA 1'],
            ['name' => 'DVR MSA 1 IP CAM 02',  'channel' => 1901, 'notes' => 'IP Camera 02 via DVR MSA 1'],
        ];

        foreach ($ipCams as $cam) {
            $ch = $cam['channel'];
            $this->upsert([
                'name'              => $cam['name'],
                'type'              => 'camera',
                'ip_address'        => $ip,
                'location'          => $loc,
                'web_port'          => 80,
                'rtsp_port'         => 554,
                'rtsp_path'         => '/Streaming/Channels/' . $ch,
                'snapshot_url'      => "http://{$ip}/ISAPI/Streaming/channels/{$ch}/picture",
                'snapshot_enabled'  => true,
                'snapshot_username' => $user,
                'snapshot_password' => $pass,
                'is_active'         => true,
                'notes'             => $cam['notes'],
            ]);
        }

        $this->command->info("DVR MSA 1 ({$ip}): 16 analog + 3 IP cam di-seed.");
    }

    private function seedDvr2(): void
    {
        $ip   = self::DVR2_IP;
        $user = self::DVR2_USER;
        $pass = self::DVR2_PASS;
        $loc  = self::DVR2_LOCATION;

        // ---- DVR unit ----
        $this->upsert([
            'name'              => 'DVR MSA 2',
            'type'              => 'dvr',
            'ip_address'        => $ip,
            'location'          => $loc,
            'web_port'          => 80,
            'rtsp_port'         => 554,
            'snapshot_enabled'  => false,
            'snapshot_username' => $user,
            'snapshot_password' => $pass,
            'is_active'         => true,
            'notes'             => 'Hikvision Embedded Net DVR 16ch',
        ]);

        // ---- Analog Camera 01–16 ----
        for ($n = 1; $n <= 16; $n++) {
            $channel = ($n * 100) + 1;

            $this->upsert([
                'name'              => 'DVR MSA 2 CAM ' . str_pad($n, 2, '0', STR_PAD_LEFT),
                'type'              => 'camera',
                'ip_address'        => $ip,
                'location'          => $loc,
                'web_port'          => 80,
                'rtsp_port'         => 554,
                'rtsp_path'         => '/Streaming/Channels/' . $channel,
                'snapshot_url'      => "http://{$ip}/ISAPI/Streaming/channels/{$channel}/picture",
                'snapshot_enabled'  => true,
                'snapshot_username' => $user,
                'snapshot_password' => $pass,
                'is_active'         => true,
                'notes'             => "Analog channel {$n} DVR MSA 2",
            ]);
        }

        $this->command->info("DVR MSA 2 ({$ip}): 16 analog cam di-seed.");
    }

    private function upsert(array $data): void
    {
        Device::updateOrCreate(
            ['name' => $data['name'], 'ip_address' => $data['ip_address']],
            $data
        );
    }
}
