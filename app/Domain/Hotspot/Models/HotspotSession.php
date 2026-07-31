<?php

namespace App\Domain\Hotspot\Models;

use App\Domain\Hotspot\Enums\HotspotSessionStatus;
use App\Domain\Shared\Concerns\BelongsToTenant;
use Database\Factories\HotspotSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'mac_address', 'hotspot_plan_id', 'amount_paid', 'payment_reference', 'status', 'starts_at', 'expires_at', 'revoked_at'])]
#[UseFactory(HotspotSessionFactory::class)]
class HotspotSession extends Model
{
    /** @use HasFactory<HotspotSessionFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'status' => HotspotSessionStatus::class,
            'amount_paid' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(HotspotPlan::class, 'hotspot_plan_id');
    }
}
