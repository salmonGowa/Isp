<?php

namespace App\Domain\Hotspot\Models;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use App\Domain\Shared\Concerns\BelongsToTenant;
use Database\Factories\HotspotPlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['tenant_id', 'name', 'duration_minutes', 'price', 'status'])]
#[UseFactory(HotspotPlanFactory::class)]
class HotspotPlan extends Model
{
    /** @use HasFactory<HotspotPlanFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'status' => HotspotPlanStatus::class,
            'price' => 'decimal:2',
        ];
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(HotspotSession::class);
    }
}
