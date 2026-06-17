<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = [
        'name',
        'type',
        'ip_address',
        'location',
        'web_port',
        'rtsp_port',
        'onvif_port',
        'rtsp_path',
        'snapshot_url',
        'snapshot_enabled',
        'snapshot_username',
        'snapshot_password',
        'is_active',
        'network_status',
        'service_status',
        'visual_status',
        'last_checked_at',
        'notes',
    ];

    protected $casts = [
        'snapshot_enabled' => 'boolean',
        'is_active' => 'boolean',
        'last_checked_at' => 'datetime',
    ];

    protected $hidden = [
        'snapshot_password',
    ];

    public function checks()
    {
        return $this->hasMany(DeviceCheck::class);
    }

    public function alerts()
    {
        return $this->hasMany(DeviceAlert::class);
    }

    public function openAlerts()
    {
        return $this->hasMany(DeviceAlert::class)->where('status', 'open');
    }

    public function snapshots()
    {
        return $this->hasMany(CameraSnapshot::class);
    }

    public function latestSnapshot()
    {
        return $this->hasOne(CameraSnapshot::class)->latestOfMany('captured_at');
    }

    public function overallStatus(): string
    {
        if ($this->network_status === 'down' || $this->service_status === 'down') {
            return 'down';
        }

        if ($this->visual_status === 'abnormal') {
            return 'abnormal';
        }

        if ($this->network_status === 'unknown' && $this->service_status === 'unknown') {
            return 'unknown';
        }

        return 'up';
    }

    public function rtspUrl(?string $username = null, ?string $password = null): ?string
    {
        if (!$this->rtsp_port) {
            return null;
        }

        $auth = '';
        if ($username) {
            $auth = $username . ($password ? ':' . $password : '') . '@';
        }

        $path = $this->rtsp_path ? '/' . ltrim($this->rtsp_path, '/') : '';

        return "rtsp://{$auth}{$this->ip_address}:{$this->rtsp_port}{$path}";
    }
}
