<?php

namespace App\Services;

use App\Jobs\SendWaTemplateJob;
use App\Models\Device;
use App\Models\DeviceAlert;
use App\Services\WhatsApp\CctvAlertMessageFactory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AlertService
{
    /**
     * Buka alert baru jika belum ada alert open untuk kombinasi ini,
     * lalu kirim notifikasi.
     */
    public function trigger(Device $device, string $level, string $checkType, string $message): DeviceAlert
    {
        $existing = DeviceAlert::query()
            ->where('device_id', $device->id)
            ->where('level', $level)
            ->where('check_type', $checkType)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return $existing;
        }

        $alert = DeviceAlert::create([
            'device_id' => $device->id,
            'level' => $level,
            'check_type' => $checkType,
            'status' => 'open',
            'message' => $message,
            'triggered_at' => now(),
        ]);

        $this->notify($device, $alert);

        return $alert;
    }

    /**
     * Tutup alert open (kalau check kembali normal).
     */
    public function resolve(Device $device, string $level, string $checkType): void
    {
        $alerts = DeviceAlert::query()
            ->where('device_id', $device->id)
            ->where('level', $level)
            ->where('check_type', $checkType)
            ->where('status', 'open')
            ->get();

        foreach ($alerts as $alert) {
            $alert->update([
                'status' => 'resolved',
                'resolved_at' => now(),
            ]);

            $this->notifyResolved($device, $alert);
        }
    }

    protected function notify(Device $device, DeviceAlert $alert): void
    {
        $text = sprintf(
            "🔴 *CCTV ALERT*\nDevice: %s (%s)\nLokasi: %s\nLevel: %s\nCheck: %s\nPesan: %s\nWaktu: %s",
            $device->name,
            $device->ip_address,
            $device->location ?? '-',
            strtoupper($alert->level),
            $alert->check_type,
            $alert->message,
            $alert->triggered_at->format('Y-m-d H:i:s')
        );

        $this->sendTelegram($text);
        $this->sendWa($device, $alert, false);

        $alert->update(['notified_at' => now()]);
    }

    protected function notifyResolved(Device $device, DeviceAlert $alert): void
    {
        $text = sprintf(
            "🟢 *CCTV RESOLVED*\nDevice: %s (%s)\nLokasi: %s\nLevel: %s\nCheck: %s\nNormal kembali pada: %s",
            $device->name,
            $device->ip_address,
            $device->location ?? '-',
            strtoupper($alert->level),
            $alert->check_type,
            now()->format('Y-m-d H:i:s')
        );

        $this->sendTelegram($text);
        $this->sendWa($device, $alert, true);
    }

    /**
     * Kirim notifikasi WA (template ticket_notify_any, sama seperti SHM Check)
     * ke semua nomor di config('whatsapp.recipients.cctv_numbers').
     */
    protected function sendWa(Device $device, DeviceAlert $alert, bool $resolved): void
    {
        $numbers = config('whatsapp.recipients.cctv_numbers', []);

        if (empty($numbers)) {
            return;
        }

        $templateName = config('whatsapp.defaults.ticket_template', 'ticket_notify_any');
        $template = config("whatsapp.qontak.templates.{$templateName}") ?: $templateName;
        $factory = new CctvAlertMessageFactory();

        $vars = $resolved
            ? $factory->buildResolvedVars($device, $alert)
            : $factory->buildAlertVars($device, $alert);

        foreach ($numbers as $number) {
            try {
                SendWaTemplateJob::dispatch($number, $template, $vars, ['to_name' => 'Tim IT'])->onQueue('wa');
            } catch (\Throwable $e) {
                Log::warning('Gagal dispatch WA alert: ' . $e->getMessage());
            }
        }
    }

    protected function sendTelegram(string $text): void
    {
        $token = config('cctv.telegram.bot_token');
        $chatId = config('cctv.telegram.chat_id');

        if (!$token || !$chatId) {
            Log::info('CCTV alert (telegram not configured): ' . $text);
            return;
        }

        try {
            Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'Markdown',
            ]);
        } catch (\Throwable $e) {
            Log::warning('Gagal kirim alert telegram: ' . $e->getMessage());
        }
    }
}
