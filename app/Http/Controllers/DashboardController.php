<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceAlert;

class DashboardController extends Controller
{
    public function index()
    {
        $devices = Device::query()
            ->with('latestSnapshot')
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        $summary = [
            'total' => $devices->count(),
            'network_down' => $devices->where('network_status', 'down')->count(),
            'service_down' => $devices->where('service_status', 'down')->count(),
            'visual_abnormal' => $devices->where('visual_status', 'abnormal')->count(),
        ];

        $openAlerts = DeviceAlert::query()
            ->with('device')
            ->where('status', 'open')
            ->orderByDesc('triggered_at')
            ->limit(20)
            ->get();

        return view('dashboard.index', compact('devices', 'summary', 'openAlerts'));
    }
}
