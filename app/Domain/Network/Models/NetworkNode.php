<?php

namespace App\Domain\Network\Models;

use App\Domain\Network\Enums\NetworkNodeStatus;
use App\Domain\Network\Enums\NetworkNodeType;
use App\Domain\Shared\Concerns\BelongsToTenant;
use Database\Factories\NetworkNodeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['tenant_id', 'identifier', 'type', 'zone', 'status', 'uptime_pct', 'load_pct', 'subscriber_count'])]
#[UseFactory(NetworkNodeFactory::class)]
class NetworkNode extends Model
{
    /** @use HasFactory<NetworkNodeFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'type' => NetworkNodeType::class,
            'status' => NetworkNodeStatus::class,
            'uptime_pct' => 'decimal:2',
            'load_pct' => 'decimal:2',
        ];
    }
}
