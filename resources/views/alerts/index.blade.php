@extends('layouts.app')

@section('title', 'Alerts - CCTV Monitoring')

@section('content')
<h1 class="text-xl font-black text-slate-900">Riwayat Alert</h1>

<div class="mt-3 flex gap-2 text-sm">
    @foreach (['open' => 'Open', 'resolved' => 'Resolved', 'all' => 'Semua'] as $value => $text)
        <a href="{{ route('alerts.index', ['status' => $value]) }}"
           class="rounded-xl px-3 py-1.5 font-bold {{ $status === $value ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-700' }}">
            {{ $text }}
        </a>
    @endforeach
</div>

<div class="mt-4 space-y-2">
    @forelse ($alerts as $alert)
        <div class="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span class="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase {{ $alert->status === 'open' ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-700' }}">
                        {{ $alert->status }}
                    </span>
                    <span class="ml-2 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {{ $alert->level }}
                    </span>
                    <a href="{{ route('devices.show', $alert->device) }}" class="ml-2 font-bold hover:underline">
                        {{ $alert->device->name ?? '-' }}
                    </a>
                    <span class="ml-1 text-xs text-slate-500">({{ $alert->check_type }})</span>
                </div>
                <div class="text-xs text-slate-500">
                    {{ $alert->triggered_at->format('d/m/Y H:i:s') }}
                    @if ($alert->resolved_at)
                        &rarr; selesai {{ $alert->resolved_at->format('d/m/Y H:i:s') }}
                    @endif
                </div>
            </div>
            <div class="mt-1 text-slate-700">{{ $alert->message }}</div>
        </div>
    @empty
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            Tidak ada data.
        </div>
    @endforelse
</div>

<div class="mt-4">
    {{ $alerts->links() }}
</div>
@endsection
