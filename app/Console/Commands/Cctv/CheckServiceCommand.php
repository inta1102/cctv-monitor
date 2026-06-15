<?php

namespace App\Console\Commands\Cctv;

use App\Models\Device;
use App\Models\DeviceCheck;
use App\Services\AlertService;
use Illuminate\Console\Command;

class CheckServiceCommand extends Command
{
    protected $signature = 'cctv:check-service';

    protected $description = 'Level 2 - Cek port RTSP / web DVR / ONVIF pada device CCTV';

    public function handle(AlertService $alerts): int
    {
        $timeout = (int) config('cctv.check_timeout', 3);

        $devices = Device::query()
            ->where('is_active', true)
            ->where('network_status', 'up')
            ->get();

        foreach ($devices as $device) {
            $ports = [
                'rtsp' => $device->rtsp_port,
                'web' => $device->web_port,
                'onvif' => $device->onvif_port,
            ];

            $deviceUp = true;
            $anyChecked = false;

            foreach ($ports as $checkType => $port) {
                if (!$port) {
                    continue;
                }

                $anyChecked = true;
                $result = $this->checkPort($device->ip_address, (int) $port, $timeout);
                $status = $result['open'] ? 'up' : 'down';

                DeviceCheck::create([
                    'device_id' => $device->id,
                    'level' => 'service',
                    'check_type' => $checkType,
                    'status' => $status,
                    'response_time_ms' => $result['time_ms'],
                    'message' => $result['message'],
                    'checked_at' => now(),
                ]);

                if ($status === 'down') {
                    $deviceUp = false;

                    $alerts->trigger(
                        $device,
                        'service',
                        $checkType,
                        "Port {$checkType} ({$port}) pada {$device->name} ({$device->ip_address}) tidak bisa diakses."
                    );

                    $this->warn("[DOWN] {$device->name} - {$checkType}:{$port}");
                } else {
                    $alerts->resolve($device, 'service', $checkType);
                    $this->info("[UP]   {$device->name} - {$checkType}:{$port} ({$result['time_ms']} ms)");
                }
            }

            if ($anyChecked) {
                $device->update([
                    'service_status' => $deviceUp ? 'up' : 'down',
                    'last_checked_at' => now(),
                ]);
            }
        }

        return self::SUCCESS;
    }

    protected function checkPort(string $host, int $port, int $timeoutSeconds): array
    {
        $start = microtime(true);

        $connection = @fsockopen($host, $port, $errno, $errstr, $timeoutSeconds);

        $elapsedMs = (int) round((microtime(true) - $start) * 1000);

        if ($connection) {
            fclose($connection);

            return [
                'open' => true,
                'time_ms' => $elapsedMs,
                'message' => 'Port terbuka.',
            ];
        }

        return [
            'open' => false,
            'time_ms' => $elapsedMs,
            'message' => "Port tertutup/tidak respon: {$errstr} ({$errno})",
        ];
    }
}
