<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceAlert extends Model
{
    protected $fillable = [
        'device_id',
        'level',
        'check_type',
        'status',
        'message',
        'triggered_at',
        'resolved_at',
        'notified_at',
    ];

    protected $casts = [
        'triggered_at' => 'datetime',
        'resolved_at' => 'datetime',
        'notified_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
