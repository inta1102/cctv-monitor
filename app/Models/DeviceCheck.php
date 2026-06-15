<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceCheck extends Model
{
    protected $fillable = [
        'device_id',
        'level',
        'check_type',
        'status',
        'response_time_ms',
        'message',
        'checked_at',
    ];

    protected $casts = [
        'checked_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
