@extends('layouts.app')

@section('title', 'Dashboard - CCTV Monitoring')

@section('content')
@php
    $badge = function (string $status) {
        return match ($status) {
            'up', 'ok' => 'bg-emerald-100 text-emerald-700 border border-emerald-200',
            'down', 'abnormal' => 'bg-rose-100 text-rose-700 border border-rose-200',
            default => 'bg-slate-100 text-slate-500 border border-slate-200',
        };
    };

    $label = function (string $status) {
        return match ($status) {
            'up' => 'UP', 'down' => 'DOWN',
            'ok' => 'OK', 'abnormal' => 'ABNORMAL',
            default => '-',
        };
    };
@endphp

<h1 class="text-xl font-black text-slate-900">Dashboard Monitoring CCTV</h1>

<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
    <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <div class="text-xs text-slate-500">Total Device</div>
        <div class="text-2xl font-black">{{ $summary['total'] }}</div>
    </div>
    <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div class="text-xs text-rose-600">Network Down (Level 1)</div>
        <div class="text-2xl font-black text-rose-700">{{ $summary['network_down'] }}</div>
    </div>
    <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div class="text-xs text-amber-700">Service Down (Level 2)</div>
        <div class="text-2xl font-black text-amber-700">{{ $summary['service_down'] }}</div>
    </div>
    <div class="rounded-2xl border border-purple-200 bg-purple-50 p-4">
        <div class="text-xs text-purple-700">Visual Abnormal (Level 3)</div>
        <div class="text-2xl font-black text-purple-700">{{ $summary['visual_abnormal'] }}</div>
    </div>
</div>

<div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table class="w-full min-w-[760px] text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
                <th class="px-4 py-3">Device</th>
                <th class="px-4 py-3">Tipe</th>
                <th class="px-4 py-3">IP</th>
                <th class="px-4 py-3">Lokasi</th>
                <th class="px-4 py-3">Level 1<br>Network</th>
                <th class="px-4 py-3">Level 2<br>Service</th>
                <th class="px-4 py-3">Level 3<br>Visual</th>
                <th class="px-4 py-3">Snapshot</th>
                <th class="px-4 py-3">Update Terakhir</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse ($devices as $device)
                <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-bold">
                        <a href="{{ route('devices.show', $device) }}" class="hover:underline">{{ $device->name }}</a>
                    </td>
                    <td class="px-4 py-3 uppercase text-xs text-slate-500">{{ $device->type }}</td>
                    <td class="px-4 py-3 text-xs">{{ $device->ip_address }}</td>
                    <td class="px-4 py-3 text-xs">{{ $device->location ?? '-' }}</td>
                    <td class="px-4 py-3">
                        <span class="rounded-lg px-2 py-1 text-[11px] font-bold {{ $badge($device->network_status) }}">
                            {{ $label($device->network_status) }}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="rounded-lg px-2 py-1 text-[11px] font-bold {{ $badge($device->service_status) }}">
                            {{ $label($device->service_status) }}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="rounded-lg px-2 py-1 text-[11px] font-bold {{ $badge($device->visual_status) }}">
                            {{ $label($device->visual_status) }}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        @if ($device->latestSnapshot)
                            <img src="{{ asset($device->latestSnapshot->file_path) }}" class="h-10 w-16 rounded object-cover border border-slate-200" alt="snapshot">
                        @else
                            <span class="text-xs text-slate-400">-</span>
                        @endif
                    </td>
                    <td class="px-4 py-3 text-xs text-slate-500">
                        {{ $device->last_checked_at?->format('d/m/Y H:i:s') ?? '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="px-4 py-6 text-center text-sm text-slate-500">
                        Belum ada device. <a href="{{ route('devices.create') }}" class="font-bold text-blue-600 hover:underline">Tambah device</a>.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-6">
    <h2 class="text-lg font-black text-slate-900">Alert Aktif</h2>

    <div class="mt-3 space-y-2">
        @forelse ($openAlerts as $alert)
            <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <span class="rounded-lg bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            {{ $alert->level }}
                        </span>
                        <span class="ml-2 font-bold">{{ $alert->device->name ?? '-' }}</span>
                        <span class="ml-1 text-xs text-slate-500">({{ $alert->check_type }})</span>
                    </div>
                    <div class="text-xs text-slate-500">{{ $alert->triggered_at->format('d/m/Y H:i:s') }}</div>
                </div>
                <div class="mt-1 text-rose-700">{{ $alert->message }}</div>
            </div>
        @empty
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                Tidak ada alert aktif. Semua normal. ✅
            </div>
        @endforelse
    </div>

    <div class="mt-3">
        <a href="{{ route('alerts.index') }}" class="text-sm font-bold text-blue-600 hover:underline">Lihat semua alert &rarr;</a>
    </div>
</div>
@endsection
