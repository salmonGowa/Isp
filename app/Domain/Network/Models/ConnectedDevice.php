<?php

namespace App\Domain\Network\Models;

use App\Domain\Network\Enums\DeviceType;
use App\Domain\Shared\Concerns\BelongsToTenant;
use App\Domain\Subscribers\Models\Subscriber;
use Database\Factories\ConnectedDeviceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tenant_id', 'subscriber_id', 'name', 'type', 'ip_address', 'connected_since', 'usage_gb_cycle', 'is_paused'])]
#[UseFactory(ConnectedDeviceFactory::class)]
class ConnectedDevice extends Model
{
    /** @use HasFactory<ConnectedDeviceFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'type' => DeviceType::class,
            'connected_since' => 'datetime',
            'usage_gb_cycle' => 'decimal:2',
            'is_paused' => 'boolean',
        ];
    }

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class);
    }
}
