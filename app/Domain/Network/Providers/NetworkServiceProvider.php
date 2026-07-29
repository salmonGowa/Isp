<?php

namespace App\Domain\Network\Providers;

use App\Domain\Network\Contracts\RadiusProvisionerContract;
use App\Domain\Network\Services\LogRadiusProvisioner;
use Illuminate\Support\ServiceProvider;

class NetworkServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(RadiusProvisionerContract::class, LogRadiusProvisioner::class);
    }
}
