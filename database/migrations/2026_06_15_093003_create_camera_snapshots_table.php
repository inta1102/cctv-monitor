<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camera_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();

            $table->string('file_path');

            // hasil analisa visual
            $table->enum('visual_status', ['ok', 'abnormal', 'unknown'])->default('unknown');
            $table->json('flags')->nullable(); // ['blank','freeze','no_signal','dark']
            $table->decimal('brightness_avg', 8, 3)->nullable();
            $table->decimal('diff_from_previous', 8, 4)->nullable();

            $table->timestamp('captured_at');
            $table->timestamps();

            $table->index(['device_id', 'captured_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camera_snapshots');
    }
};
