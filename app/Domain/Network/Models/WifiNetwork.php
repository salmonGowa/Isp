<?php

namespace App\Domain\Network\Models;

use App\Domain\Shared\Concerns\BelongsToTenant;
use App\Domain\Subscribers\Models\Subscriber;
use Database\Factories\WifiNetworkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * `wifi_password` is intentionally plaintext-viewable — this simulates a
 * router's own printed/CPE-provisioned WPA key, not a platform login
 * credential, so it deliberately isn't hashed like Subscriber::password.
 */
#[Fillable(['tenant_id', 'subscriber_id', 'ssid', 'wifi_password', 'password_updated_at'])]
#[UseFactory(WifiNetworkFactory::class)]
class WifiNetwork extends Model
{
    /** @use HasFactory<WifiNetworkFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'password_updated_at' => 'datetime',
        ];
    }

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class);
    }
}
