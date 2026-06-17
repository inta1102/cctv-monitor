@extends('layouts.app')

@section('title', ($device->exists ? 'Edit' : 'Tambah') . ' Device')

@section('content')
<h1 class="text-xl font-black text-slate-900">{{ $device->exists ? 'Edit Device' : 'Tambah Device' }}</h1>

<form method="POST" action="{{ $device->exists ? route('devices.update', $device) : route('devices.store') }}" class="mt-4 max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
    @csrf
    @if ($device->exists) @method('PUT') @endif

    @if ($errors->any())
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <ul class="list-disc pl-5">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
            <label class="text-xs font-bold text-slate-600">Nama Device</label>
            <input type="text" name="name" value="{{ old('name', $device->name) }}" required
                   class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
        </div>

        <div>
            <label class="text-xs font-bold text-slate-600">Tipe</label>
            <select name="type" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                @foreach (['dvr' => 'DVR', 'nvr' => 'NVR', 'camera' => 'IP Camera', 'switch' => 'Switch', 'router' => 'Router'] as $value => $text)
                    <option value="{{ $value }}" @selected(old('type', $device->type) === $value)>{{ $text }}</option>
                @endforeach
            </select>
        </div>

        <div>
            <label class="text-xs font-bold text-slate-600">IP Address</label>
            <input type="text" name="ip_address" value="{{ old('ip_address', $device->ip_address) }}" required
                   class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="192.168.1.10">
        </div>

        <div>
            <label class="text-xs font-bold text-slate-600">Lokasi</label>
            <input type="text" name="location" value="{{ old('location', $device->location) }}"
                   class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Lobby / Lantai 1">
        </div>
    </div>

    <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div class="text-xs font-black text-slate-600 mb-2">Level 2 - Service Ports</div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
                <label class="text-xs font-bold text-slate-600">Web Port (DVR/NVR)</label>
                <input type="number" name="web_port" value="{{ old('web_port', $device->web_port) }}"
                       class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="80">
            </div>
            <div>
                <label class="text-xs font-bold text-slate-600">RTSP Port</label>
                <input type="number" name="rtsp_port" value="{{ old('rtsp_port', $device->rtsp_port) }}"
                       class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="554">
            </div>
            <div>
                <label class="text-xs font-bold text-slate-600">ONVIF Port</label>
                <input type="number" name="onvif_port" value="{{ old('onvif_port', $device->onvif_port) }}"
                       class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="8000">
            </div>
        </div>
        <div class="mt-3">
            <label class="text-xs font-bold text-slate-600">RTSP Path</label>
            <input type="text" name="rtsp_path" value="{{ old('rtsp_path', $device->rtsp_path) }}"
                   class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="/Streaming/Channels/101">
        </div>
        <div class="mt-3">
            <label class="text-xs font-bold text-slate-600">Snapshot URL (HTTP ISAPI)</label>
            <input type="text" name="snapshot_url" value="{{ old('snapshot_url', $device->snapshot_url) }}"
                   class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="http://192.168.x.x/ISAPI/Streaming/channels/101/picture">
            <p class="mt-1 text-xs text-slate-400">Isi untuk DVR Hikvision (ISAPI). Kosongkan jika pakai RTSP.</p>
        </div>
    </div>

    <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div class="text-xs font-black text-slate-600 mb-2">Level 3 - Visual Health Check (Snapshot)</div>

        <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="snapshot_enabled" value="1" @checked(old('snapshot_enabled', $device->snapshot_enabled))>
            Aktifkan snapshot otomatis untuk device ini
        </label>

        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
                <label class="text-xs font-bold text-slate-600">Username RTSP</label>
                <input type="text" name="snapshot_username" value="{{ old('snapshot_username', $device->snapshot_username) }}"
                       class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            </div>
            <div>
                <label class="text-xs font-bold text-slate-600">Password RTSP</label>
                <input type="password" name="snapshot_password" placeholder="{{ $device->exists ? '(kosongkan jika tidak diubah)' : '' }}"
                       class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            </div>
        </div>
    </div>

    <div>
        <label class="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" name="is_active" value="1" @checked(old('is_active', $device->is_active ?? true))>
            Device aktif dimonitor
        </label>
    </div>

    <div>
        <label class="text-xs font-bold text-slate-600">Catatan</label>
        <textarea name="notes" rows="2" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">{{ old('notes', $device->notes) }}</textarea>
    </div>

    <div class="flex gap-2">
        <button type="submit" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
            Simpan
        </button>
        <a href="{{ route('devices.index') }}" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Batal
        </a>
    </div>
</form>
@endsection
