@extends('layouts.app')

@section('title', 'Devices - CCTV Monitoring')

@section('content')
<div class="flex items-center justify-between">
    <h1 class="text-xl font-black text-slate-900">Daftar Device</h1>
    <a href="{{ route('devices.create') }}" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
        + Tambah Device
    </a>
</div>

<div class="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table class="w-full min-w-[760px] text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
                <th class="px-4 py-3">Nama</th>
                <th class="px-4 py-3">Tipe</th>
                <th class="px-4 py-3">IP</th>
                <th class="px-4 py-3">Ports</th>
                <th class="px-4 py-3">Snapshot</th>
                <th class="px-4 py-3">Aktif</th>
                <th class="px-4 py-3"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @foreach ($devices as $device)
                <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-bold">
                        <a href="{{ route('devices.show', $device) }}" class="hover:underline">{{ $device->name }}</a>
                        <div class="text-xs text-slate-400">{{ $device->location }}</div>
                    </td>
                    <td class="px-4 py-3 uppercase text-xs">{{ $device->type }}</td>
                    <td class="px-4 py-3 text-xs">{{ $device->ip_address }}</td>
                    <td class="px-4 py-3 text-xs">
                        @if ($device->web_port) Web:{{ $device->web_port }} @endif
                        @if ($device->rtsp_port) RTSP:{{ $device->rtsp_port }} @endif
                        @if ($device->onvif_port) ONVIF:{{ $device->onvif_port }} @endif
                    </td>
                    <td class="px-4 py-3 text-xs">
                        {{ $device->snapshot_enabled ? 'Aktif' : '-' }}
                    </td>
                    <td class="px-4 py-3 text-xs">
                        {{ $device->is_active ? 'Ya' : 'Tidak' }}
                    </td>
                    <td class="px-4 py-3 text-right text-xs">
                        <a href="{{ route('devices.edit', $device) }}" class="font-bold text-blue-600 hover:underline">Edit</a>
                        <form action="{{ route('devices.destroy', $device) }}" method="POST" class="inline" onsubmit="return confirm('Hapus device ini?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="ml-2 font-bold text-rose-600 hover:underline">Hapus</button>
                        </form>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
