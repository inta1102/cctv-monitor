<?php

namespace App\Services\WhatsApp;

use App\Models\Device;
use App\Models\DeviceAlert;

class CctvAlertMessageFactory
{
    /**
     * Bangun var1..var5 untuk template universal "ticket_notify_any",
     * format sama dengan SHM Check (CRMS).
     */
    public function buildAlertVars(Device $device, DeviceAlert $alert): array
    {
        $levelLabel = match ($alert->level) {
            'network' => 'NETWORK',
            'service' => 'SERVICE',
            'visual' => 'VISUAL',
            default => strtoupper($alert->level),
        };

        return [
            'Halo Tim IT',
            "ALERT · {$levelLabel} - {$device->name}",
            "Device: {$device->name} ({$device->ip_address}) — Check: {$alert->check_type}",
            $alert->triggered_at->format('d M Y H:i') . ' WIB',
            "Lokasi: " . ($device->location ?? '-') . " ; Pesan: {$alert->message}",
        ];
    }

    public function buildResolvedVars(Device $device, DeviceAlert $alert): array
    {
        $levelLabel = match ($alert->level) {
            'network' => 'NETWORK',
            'service' => 'SERVICE',
            'visual' => 'VISUAL',
            default => strtoupper($alert->level),
        };

        return [
            'Halo Tim IT',
            "RESOLVED · {$levelLabel} - {$device->name}",
            "Device: {$device->name} ({$device->ip_address}) — Check: {$alert->check_type}",
            now()->format('d M Y H:i') . ' WIB',
            "Lokasi: " . ($device->location ?? '-') . " ; Status sudah normal kembali.",
        ];
    }
}
