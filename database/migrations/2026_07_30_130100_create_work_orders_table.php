<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->index();
            $table->string('type');
            $table->foreignId('subscriber_id')->nullable()->constrained('subscribers')->nullOnDelete();
            $table->string('lead_name')->nullable();
            $table->string('address');
            $table->foreignId('technician_id')->nullable()->constrained('technicians')->nullOnDelete();
            $table->timestamp('scheduled_at');
            $table->string('status')->default('scheduled');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index('technician_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
