<?php

namespace App\Domain\Network\Models;

use App\Domain\Shared\Concerns\BelongsToTenant;
use App\Domain\Subscribers\Models\Subscriber;
use Database\Factories\DailyUsageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'subscriber_id', 'usage_date', 'download_gb', 'upload_gb'])]
#[UseFactory(DailyUsageFactory::class)]
class DailyUsage extends Model
{
    /** @use HasFactory<DailyUsageFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'usage_date' => 'date',
            'download_gb' => 'decimal:2',
            'upload_gb' => 'decimal:2',
        ];
    }

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class);
    }
}
