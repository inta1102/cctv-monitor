<?php

namespace App\Console\Commands\Cctv;

use App\Models\Device;
use App\Models\DeviceCheck;
use App\Services\AlertService;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class CheckNetworkCommand extends Command
{
    protected $signature = 'cctv:check-network';

    protected $description = 'Level 1 - Cek ping/koneksi jaringan ke semua device CCTV (DVR/NVR/Camera/Switch/Router)';

    public function handle(AlertService $alerts): int
    {
        $timeout = (int) config('cctv.check_timeout', 3);

        $devices = Device::query()->where('is_active', true)->get();

        foreach ($devices as $device) {
            $result = $this->ping($device->ip_address, $timeout);

            $status = $result['up'] ? 'up' : 'down';

            DeviceCheck::create([
                'device_id' => $device->id,
                'level' => 'network',
                'check_type' => 'ping',
                'status' => $status,
                'response_time_ms' => $result['time_ms'],
                'message' => $result['message'],
                'checked_at' => now(),
            ]);

            $device->update([
                'network_status' => $status,
                'last_checked_at' => now(),
            ]);

            if ($status === 'down') {
                $alerts->trigger(
                    $device,
                    'network',
                    'ping',
                    "Device {$device->name} ({$device->ip_address}) tidak merespon ping."
                );

                $device->update([
                    'service_status' => 'down',
                    'visual_status' => 'abnormal',
                ]);

                $this->warn("[DOWN] {$device->name} ({$device->ip_address})");
            } else {
                $alerts->resolve($device, 'network', 'ping');
                $this->info("[UP]   {$device->name} ({$device->ip_address}) - {$result['time_ms']} ms");
            }
        }

        return self::SUCCESS;
    }

    /**
     * Ping host, mendukung Windows & Linux.
     */
    protected function ping(string $host, int $timeoutSeconds): array
    {
        $isWindows = PHP_OS_FAMILY === 'Windows';

        if ($isWindows) {
            $cmd = ['ping', '-n', '1', '-w', (string) ($timeoutSeconds * 1000), $host];
        } else {
            $cmd = ['ping', '-c', '1', '-W', (string) $timeoutSeconds, $host];
        }

        $start = microtime(true);

        try {
            $process = new Process($cmd);
            $process->setTimeout($timeoutSeconds + 2);
            $process->run();

            $elapsedMs = (int) round((microtime(true) - $start) * 1000);

            if ($process->isSuccessful()) {
                return [
                    'up' => true,
                    'time_ms' => $elapsedMs,
                    'message' => 'Ping berhasil.',
                ];
            }

            return [
                'up' => false,
                'time_ms' => $elapsedMs,
                'message' => 'Ping gagal / timeout.',
            ];
        } catch (\Throwable $e) {
            return [
                'up' => false,
                'time_ms' => null,
                'message' => 'Error ping: ' . $e->getMessage(),
            ];
        }
    }
}
