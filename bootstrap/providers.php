<?php

use App\Domain\Billing\Providers\BillingServiceProvider;
use App\Domain\Hotspot\Providers\HotspotServiceProvider;
use App\Domain\Network\Providers\NetworkServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    BillingServiceProvider::class,
    NetworkServiceProvider::class,
    HotspotServiceProvider::class,
];
