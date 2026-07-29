<?php

namespace App\Providers;

use App\Domain\Subscribers\Events\SubscriberActivated;
use App\Domain\Subscribers\Events\SubscriberSuspended;
use App\Domain\Subscribers\Listeners\SyncRadiusOnStatusChange;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(SubscriberActivated::class, [SyncRadiusOnStatusChange::class, 'handleSubscriberActivated']);
        Event::listen(SubscriberSuspended::class, [SyncRadiusOnStatusChange::class, 'handleSubscriberSuspended']);
    }
}
