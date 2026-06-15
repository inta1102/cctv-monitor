<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();

            $table->enum('level', ['network', 'service', 'visual']);
            $table->string('check_type', 30);

            $table->enum('status', ['open', 'resolved'])->default('open');
            $table->text('message');

            $table->timestamp('triggered_at');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('notified_at')->nullable();

            $table->timestamps();

            $table->index(['device_id', 'level', 'check_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_alerts');
    }
};
