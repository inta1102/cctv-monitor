<?php

namespace App\Http\Controllers;

use App\Models\DeviceAlert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'open');

        $alerts = DeviceAlert::query()
            ->with('device')
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->orderByDesc('triggered_at')
            ->paginate(30)
            ->withQueryString();

        return view('alerts.index', compact('alerts', 'status'));
    }
}
