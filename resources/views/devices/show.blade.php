@extends('layouts.app')

@section('title', $device->name)

@section('content')
@php
    $badge = function (string $status) {
        return match ($status) {
            'up', 'ok' => 'bg-emerald-100 text-emerald-700 border border-emerald-200',
            'down', 'abnormal' => 'bg-rose-100 text-rose-700 border border-rose-200',
            default => 'bg-slate-100 text-slate-500 border border-slate-200',
        };
    };
@endphp

<div class="flex items-center justify-between">
    <div>
        <h1 class="text-xl font-black text-slate-900">{{ $device->name }}</h1>
        <div class="text-sm text-slate-500">{{ $device->ip_address }} &middot; {{ strtoupper($device->type) }} &middot; {{ $device->location ?? '-' }}</div>
    </div>
    <a href="{{ route('devices.edit', $device) }}" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
        Edit Device
    </a>
</div>

<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
    <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <div class="text-xs text-slate-500">Level 1 - Network</div>
        <span class="mt-1 inline-block rounded-lg px-2 py-1 text-[11px] font-bold {{ $badge($device->network_status) }}">
            {{ strtoupper($device->network_status) }}
        </span>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <div class="text-xs text-slate-500">Level 2 - Service</div>
        <span class="mt-1 inline-block rounded-lg px-2 py-1 text-[11px] font-bold {{ $badge($device->service_status) }}">
            {{ strtoupper($device->service_status) }}
        </span>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <div class="text-xs text-slate-500">Level 3 - Visual</div>
        <span class="mt-1 inline-block rounded-lg px-2 py-1 text-[11px] font-bold {{ $badge($device->visual_status) }}">
            {{ strtoupper($device->visual_status) }}
        </span>
    </div>
</div>

@if ($device->snapshot_enabled)
<div class="mt-6">
    <h2 class="text-lg font-black text-slate-900">Snapshot Terakhir</h2>
    <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        @forelse ($snapshots as $snap)
            <div class="rounded-xl border border-slate-200 bg-white p-2">
                <img src="{{ asset($snap->file_path) }}" class="w-full rounded-lg object-cover aspect-video" alt="snapshot">
                <div class="mt-1 text-[11px] text-slate-500">{{ $snap->captured_at->format('d/m H:i:s') }}</div>
                @if (!empty($snap->flags))
                    <div class="mt-1 flex flex-wrap gap-1">
                        @foreach ($snap->flags as $flag)
                            <span class="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">{{ $flag }}</span>
                        @endforeach
                    </div>
                @else
                    <span class="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">ok</span>
                @endif
            </div>
        @empty
            <div class="text-sm text-slate-500">Belum ada snapshot.</div>
        @endforelse
    </div>
</div>
@endif

<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div>
        <h2 class="text-lg font-black text-slate-900">Riwayat Check</h2>
        <div class="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table class="w-full text-xs">
                <thead class="bg-slate-50 text-left uppercase text-slate-500">
                    <tr>
                        <th class="px-3 py-2">Waktu</th>
                        <th class="px-3 py-2">Level</th>
                        <th class="px-3 py-2">Check</th>
                        <th class="px-3 py-2">Status</th>
                        <th class="px-3 py-2">Pesan</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach ($checks as $check)
                        <tr>
                            <td class="px-3 py-2 text-slate-500">{{ $check->checked_at->format('d/m H:i:s') }}</td>
                            <td class="px-3 py-2 uppercase">{{ $check->level }}</td>
                            <td class="px-3 py-2">{{ $check->check_type }}</td>
                            <td class="px-3 py-2">
                                <span class="rounded px-1.5 py-0.5 font-bold {{ $badge($check->status) }}">{{ strtoupper($check->status) }}</span>
                            </td>
                            <td class="px-3 py-2 text-slate-500">{{ $check->message }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div>
        <h2 class="text-lg font-black text-slate-900">Riwayat Alert</h2>
        <div class="mt-3 space-y-2">
            @forelse ($alerts as $alert)
                <div class="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                    <div class="flex items-center justify-between">
                        <span class="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase {{ $alert->status === 'open' ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-700' }}">
                            {{ $alert->status }}
                        </span>
                        <span class="text-xs text-slate-500">{{ $alert->triggered_at->format('d/m H:i:s') }}</span>
                    </div>
                    <div class="mt-1">{{ $alert->message }}</div>
                </div>
            @empty
                <div class="text-sm text-slate-500">Belum ada alert.</div>
            @endforelse
        </div>
    </div>
</div>
@endsection
