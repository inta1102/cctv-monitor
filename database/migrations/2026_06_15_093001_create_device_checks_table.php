<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();

            // level: network | service | visual
            $table->enum('level', ['network', 'service', 'visual']);

            // sub-check: ping, rtsp, web, onvif, blank, freeze, no_signal, dark
            $table->string('check_type', 30);

            $table->enum('status', ['up', 'down', 'ok', 'abnormal', 'unknown'])->default('unknown');
            $table->unsignedInteger('response_time_ms')->nullable();
            $table->text('message')->nullable();

            $table->timestamp('checked_at');
            $table->timestamps();

            $table->index(['device_id', 'level', 'check_type', 'checked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_checks');
    }
};
