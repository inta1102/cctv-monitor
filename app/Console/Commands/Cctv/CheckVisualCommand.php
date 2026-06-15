<?php

namespace App\Console\Commands\Cctv;

use App\Models\CameraSnapshot;
use App\Models\Device;
use App\Models\DeviceCheck;
use App\Services\AlertService;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class CheckVisualCommand extends Command
{
    protected $signature = 'cctv:check-visual';

    protected $description = 'Level 3 - Ambil snapshot CCTV & cek blank/freeze/no signal/gelap total';

    public function handle(AlertService $alerts): int
    {
        $devices = Device::query()
            ->where('is_active', true)
            ->where('snapshot_enabled', true)
            ->where('service_status', 'up')
            ->get();

        foreach ($devices as $device) {
            $this->checkDevice($device, $alerts);
        }

        return self::SUCCESS;
    }

    protected function checkDevice(Device $device, AlertService $alerts): void
    {
        $rtspUrl = $device->rtspUrl($device->snapshot_username, $device->snapshot_password);

        if (!$rtspUrl) {
            $this->warn("[SKIP] {$device->name}: RTSP belum dikonfigurasi.");
            return;
        }

        $relativePath = 'cctv-snapshots/' . $device->id . '/' . now()->format('Ymd_His') . '.jpg';
        $fullPath = storage_path('app/public/' . $relativePath);

        if (!is_dir(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        $captured = $this->captureFrame($rtspUrl, $fullPath);

        if (!$captured) {
            $this->recordResult($device, $alerts, 'no_signal', 'abnormal', ['no_signal'], null, null, null, 'Gagal mengambil snapshot dari RTSP (no signal).');
            return;
        }

        $analysis = $this->analyzeImage($fullPath, $device);

        $relativeForDb = 'storage/' . $relativePath;

        $snapshot = CameraSnapshot::create([
            'device_id' => $device->id,
            'file_path' => $relativeForDb,
            'visual_status' => empty($analysis['flags']) ? 'ok' : 'abnormal',
            'flags' => $analysis['flags'],
            'brightness_avg' => $analysis['brightness_avg'],
            'diff_from_previous' => $analysis['diff_from_previous'],
            'captured_at' => now(),
        ]);

        $this->updateDeviceAndAlerts($device, $alerts, $snapshot);
    }

    /**
     * Ambil 1 frame dari RTSP via ffmpeg.
     */
    protected function captureFrame(string $rtspUrl, string $outputPath): bool
    {
        $ffmpeg = config('cctv.ffmpeg_path', 'ffmpeg');
        $timeout = (int) config('cctv.check_timeout', 3) + 5;

        $cmd = [
            $ffmpeg,
            '-y',
            '-rtsp_transport', 'tcp',
            '-i', $rtspUrl,
            '-vframes', '1',
            '-q:v', '2',
            $outputPath,
        ];

        try {
            $process = new Process($cmd);
            $process->setTimeout($timeout);
            $process->run();

            return $process->isSuccessful() && file_exists($outputPath) && filesize($outputPath) > 0;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Analisa gambar: brightness rata-rata, stddev (untuk deteksi blank polos),
     * dan perbandingan dengan snapshot sebelumnya (untuk deteksi freeze).
     */
    protected function analyzeImage(string $path, Device $device): array
    {
        $flags = [];

        $image = @imagecreatefromjpeg($path);

        if (!$image) {
            return [
                'flags' => ['no_signal'],
                'brightness_avg' => null,
                'diff_from_previous' => null,
            ];
        }

        $width = imagesx($image);
        $height = imagesy($image);

        // sample grid kecil biar ringan
        $cols = 32;
        $rows = 32;

        $stepX = max(1, (int) floor($width / $cols));
        $stepY = max(1, (int) floor($height / $rows));

        $samples = [];

        for ($y = 0; $y < $height; $y += $stepY) {
            for ($x = 0; $x < $width; $x += $stepX) {
                $rgb = imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                $samples[] = ($r + $g + $b) / 3;
            }
        }

        imagedestroy($image);

        $count = count($samples);
        $avg = $count > 0 ? array_sum($samples) / $count : 0;

        $variance = 0;
        foreach ($samples as $value) {
            $variance += ($value - $avg) ** 2;
        }
        $variance = $count > 0 ? $variance / $count : 0;
        $stddev = sqrt($variance);

        $darkThreshold = (float) config('cctv.visual.dark_threshold', 12);
        $blankStddevThreshold = (float) config('cctv.visual.blank_stddev_threshold', 2.0);

        if ($avg <= $darkThreshold) {
            $flags[] = 'dark';
        }

        if ($stddev <= $blankStddevThreshold) {
            $flags[] = 'blank';
        }

        // Bandingkan dengan snapshot sebelumnya untuk deteksi freeze
        $diff = null;
        $previous = $device->snapshots()->latest('captured_at')->first();

        if ($previous && $previous->brightness_avg !== null) {
            $diff = abs($avg - (float) $previous->brightness_avg);

            $freezeDiffThreshold = (float) config('cctv.visual.freeze_diff_threshold', 1.0);

            if ($diff <= $freezeDiffThreshold && empty($flags)) {
                $flags[] = 'freeze';
            }
        }

        return [
            'flags' => $flags,
            'brightness_avg' => round($avg, 3),
            'diff_from_previous' => $diff !== null ? round($diff, 4) : null,
        ];
    }

    protected function recordResult(
        Device $device,
        AlertService $alerts,
        string $checkType,
        string $visualStatus,
        array $flags,
        ?float $brightness,
        ?float $diff,
        ?string $filePath,
        string $message
    ): void {
        DeviceCheck::create([
            'device_id' => $device->id,
            'level' => 'visual',
            'check_type' => $checkType,
            'status' => $visualStatus,
            'response_time_ms' => null,
            'message' => $message,
            'checked_at' => now(),
        ]);

        $device->update([
            'visual_status' => $visualStatus,
            'last_checked_at' => now(),
        ]);

        if ($visualStatus === 'abnormal') {
            $alerts->trigger($device, 'visual', $checkType, "{$device->name}: {$message}");
            $this->warn("[ABNORMAL] {$device->name}: {$message}");
        } else {
            $alerts->resolve($device, 'visual', $checkType);
            $this->info("[OK] {$device->name}");
        }
    }

    protected function updateDeviceAndAlerts(Device $device, AlertService $alerts, CameraSnapshot $snapshot): void
    {
        $flags = $snapshot->flags ?? [];

        // resolve semua check_type visual yang tidak lagi terjadi
        $allChecks = ['no_signal', 'dark', 'blank', 'freeze'];

        foreach ($allChecks as $checkType) {
            $isActive = in_array($checkType, $flags, true);

            DeviceCheck::create([
                'device_id' => $device->id,
                'level' => 'visual',
                'check_type' => $checkType,
                'status' => $isActive ? 'abnormal' : 'ok',
                'response_time_ms' => null,
                'message' => $isActive
                    ? "Snapshot terindikasi: {$checkType}."
                    : 'Normal.',
                'checked_at' => now(),
            ]);

            if ($isActive) {
                $alerts->trigger($device, 'visual', $checkType, "{$device->name}: snapshot terindikasi {$checkType}.");
                $this->warn("[ABNORMAL] {$device->name}: {$checkType} (brightness={$snapshot->brightness_avg})");
            } else {
                $alerts->resolve($device, 'visual', $checkType);
            }
        }

        $device->update([
            'visual_status' => empty($flags) ? 'ok' : 'abnormal',
            'last_checked_at' => now(),
        ]);

        if (empty($flags)) {
            $this->info("[OK] {$device->name} (brightness={$snapshot->brightness_avg})");
        }
    }
}
