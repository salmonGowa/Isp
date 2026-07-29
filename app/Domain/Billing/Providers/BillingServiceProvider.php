<?php

namespace App\Domain\Billing\Providers;

use App\Domain\Billing\Contracts\PaymentGatewayContract;
use App\Domain\Billing\Gateways\ManualPaymentGateway;
use Illuminate\Support\ServiceProvider;

class BillingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGatewayContract::class, ManualPaymentGateway::class);
    }
}
