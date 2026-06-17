<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceCheck;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Device::query()
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return view('devices.index', compact('devices'));
    }

    public function create()
    {
        $device = new Device();

        return view('devices.form', compact('device'));
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        Device::create($data);

        return redirect()->route('devices.index')->with('success', 'Device berhasil ditambahkan.');
    }

    public function show(Device $device)
    {
        $checks = $device->checks()
            ->orderByDesc('checked_at')
            ->limit(50)
            ->get();

        $snapshots = $device->snapshots()
            ->orderByDesc('captured_at')
            ->limit(12)
            ->get();

        $alerts = $device->alerts()
            ->orderByDesc('triggered_at')
            ->limit(20)
            ->get();

        return view('devices.show', compact('device', 'checks', 'snapshots', 'alerts'));
    }

    public function edit(Device $device)
    {
        return view('devices.form', compact('device'));
    }

    public function update(Request $request, Device $device)
    {
        $data = $this->validateData($request, $device);

        $device->update($data);

        return redirect()->route('devices.index')->with('success', 'Device berhasil diupdate.');
    }

    public function destroy(Device $device)
    {
        $device->delete();

        return redirect()->route('devices.index')->with('success', 'Device berhasil dihapus.');
    }

    protected function validateData(Request $request, ?Device $device = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:dvr,nvr,camera,switch,router'],
            'ip_address' => ['required', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'web_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'rtsp_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'onvif_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'rtsp_path' => ['nullable', 'string', 'max:255'],
            'snapshot_url' => ['nullable', 'url', 'max:500'],
            'snapshot_enabled' => ['nullable', 'boolean'],
            'snapshot_username' => ['nullable', 'string', 'max:100'],
            'snapshot_password' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['snapshot_enabled'] = $request->boolean('snapshot_enabled');
        $data['is_active'] = $request->boolean('is_active');

        if (empty($data['snapshot_password']) && $device) {
            unset($data['snapshot_password']);
        }

        return $data;
    }
}
