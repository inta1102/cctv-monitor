<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CameraSnapshot extends Model
{
    protected $fillable = [
        'device_id',
        'file_path',
        'visual_status',
        'flags',
        'brightness_avg',
        'diff_from_previous',
        'samples',
        'captured_at',
    ];

    protected $casts = [
        'flags' => 'array',
        'brightness_avg' => 'float',
        'diff_from_previous' => 'float',
        'samples' => 'array',
        'captured_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
