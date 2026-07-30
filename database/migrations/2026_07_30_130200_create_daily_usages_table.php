<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->index();
            $table->foreignId('subscriber_id')->constrained()->cascadeOnDelete();
            $table->date('usage_date');
            $table->decimal('download_gb', 6, 2)->default(0);
            $table->decimal('upload_gb', 6, 2)->default(0);
            $table->timestamps();

            $table->unique(['subscriber_id', 'usage_date']);
            $table->index(['tenant_id', 'usage_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_usages');
    }
};
