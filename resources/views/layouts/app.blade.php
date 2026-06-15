<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'CCTV Monitoring')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    @stack('head')
</head>
<body class="bg-slate-100 text-slate-800">
    <div class="min-h-screen flex flex-col">
        <header class="bg-slate-900 text-white">
            <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                <a href="{{ route('dashboard') }}" class="font-black text-lg">📹 CCTV Monitoring</a>
                <nav class="flex gap-4 text-sm font-semibold">
                    <a href="{{ route('dashboard') }}" class="hover:text-amber-300 {{ request()->routeIs('dashboard') ? 'text-amber-300' : '' }}">Dashboard</a>
                    <a href="{{ route('devices.index') }}" class="hover:text-amber-300 {{ request()->routeIs('devices.*') ? 'text-amber-300' : '' }}">Devices</a>
                    <a href="{{ route('alerts.index') }}" class="hover:text-amber-300 {{ request()->routeIs('alerts.*') ? 'text-amber-300' : '' }}">Alerts</a>
                </nav>
            </div>
        </header>

        <main class="flex-1">
            <div class="mx-auto max-w-6xl px-4 py-6">
                @if (session('success'))
                    <div class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                        {{ session('success') }}
                    </div>
                @endif

                @yield('content')
            </div>
        </main>

        <footer class="text-center text-xs text-slate-400 py-4">
            CCTV Monitoring &middot; Level 1 (Network) &middot; Level 2 (Service) &middot; Level 3 (Visual)
        </footer>
    </div>
    @stack('scripts')
</body>
</html>
