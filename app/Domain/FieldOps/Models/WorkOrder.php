<?php

namespace App\Domain\FieldOps\Models;

use App\Domain\FieldOps\Enums\WorkOrderStatus;
use App\Domain\FieldOps\Enums\WorkOrderType;
use App\Domain\Shared\Concerns\BelongsToTenant;
use App\Domain\Subscribers\Models\Subscriber;
use Database\Factories\WorkOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'type', 'subscriber_id', 'lead_name', 'address', 'technician_id', 'scheduled_at', 'status', 'completed_at'])]
#[UseFactory(WorkOrderFactory::class)]
class WorkOrder extends Model
{
    /** @use HasFactory<WorkOrderFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'type' => WorkOrderType::class,
            'status' => WorkOrderStatus::class,
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(Technician::class);
    }
}
