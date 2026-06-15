<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['dvr', 'nvr', 'camera', 'switch', 'router'])->default('camera');
            $table->string('ip_address');
            $table->string('location')->nullable();

            // Level 2: service ports
            $table->unsignedInteger('web_port')->nullable();
            $table->unsignedInteger('rtsp_port')->nullable();
            $table->unsignedInteger('onvif_port')->nullable();
            $table->string('rtsp_path')->nullable();

            // Level 3: snapshot
            $table->boolean('snapshot_enabled')->default(false);
            $table->string('snapshot_username')->nullable();
            $table->string('snapshot_password')->nullable();

            $table->boolean('is_active')->default(true);

            // Status terkini (denormalized untuk dashboard cepat)
            $table->enum('network_status', ['unknown', 'up', 'down'])->default('unknown');
            $table->enum('service_status', ['unknown', 'up', 'down'])->default('unknown');
            $table->enum('visual_status', ['unknown', 'ok', 'abnormal'])->default('unknown');
            $table->timestamp('last_checked_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
