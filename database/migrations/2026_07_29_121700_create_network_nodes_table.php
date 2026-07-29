<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->index();
            $table->string('identifier')->unique();
            $table->string('type');
            $table->string('zone')->index();
            $table->string('status')->default('online');
            $table->decimal('uptime_pct', 5, 2)->default(100);
            $table->decimal('load_pct', 5, 2)->default(0);
            $table->unsignedInteger('subscriber_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_nodes');
    }
};
