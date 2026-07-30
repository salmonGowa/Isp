<?php

namespace App\Domain\FieldOps\Models;

use App\Domain\FieldOps\Enums\TechnicianStatus;
use App\Domain\Shared\Concerns\BelongsToTenant;
use App\Models\User;
use Database\Factories\TechnicianFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['tenant_id', 'user_id', 'status', 'zone', 'current_job_description'])]
#[UseFactory(TechnicianFactory::class)]
class Technician extends Model
{
    /** @use HasFactory<TechnicianFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'status' => TechnicianStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class);
    }
}
