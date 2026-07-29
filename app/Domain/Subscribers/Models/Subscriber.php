<?php

namespace App\Domain\Subscribers\Models;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Plans\Models\Plan;
use App\Domain\Shared\Concerns\BelongsToTenant;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Observers\SubscriberObserver;
use App\Domain\Support\Models\Ticket;
use Database\Factories\SubscriberFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Hidden(['password', 'remember_token'])]
#[ObservedBy(SubscriberObserver::class)]
#[UseFactory(SubscriberFactory::class)]
class Subscriber extends Authenticatable
{
    /** @use HasFactory<SubscriberFactory> */
    use BelongsToTenant, HasFactory, Notifiable;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'phone',
        'password',
        'plan_id',
        'status',
        'service_address',
        'zone',
        'monthly_bill',
        'joined_at',
        'last_payment_at',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => SubscriberStatus::class,
            'monthly_bill' => 'decimal:2',
            'joined_at' => 'datetime',
            'last_payment_at' => 'datetime',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
