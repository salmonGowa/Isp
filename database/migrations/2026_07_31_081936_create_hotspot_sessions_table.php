<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotspot_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->index();
            $table->string('mac_address')->index();
            $table->foreignId('hotspot_plan_id')->nullable()->constrained('hotspot_plans')->nullOnDelete();
            $table->decimal('amount_paid', 8, 2);
            $table->string('payment_reference')->nullable();
            $table->string('status')->default('active');
            $table->dateTime('starts_at');
            $table->dateTime('expires_at');
            $table->dateTime('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['mac_address', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotspot_sessions');
    }
};
