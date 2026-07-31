<?php

namespace App\Domain\Hotspot\Providers;

use App\Domain\Hotspot\Contracts\HotspotAccessProviderContract;
use App\Domain\Hotspot\Services\LogHotspotAccessProvider;
use Illuminate\Support\ServiceProvider;

class HotspotServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(HotspotAccessProviderContract::class, LogHotspotAccessProvider::class);
    }
}
