<?php

namespace App\Providers;

use App\Domain\Subscribers\Events\SubscriberActivated;
use App\Domain\Subscribers\Events\SubscriberSuspended;
use App\Domain\Subscribers\Listeners\SyncRadiusOnStatusChange;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
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

        // Brute-force protection for both login endpoints: per account+IP, plus a
        // looser per-IP cap so one host can't spray many accounts.
        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(30)->by($request->ip()),
        ]);
    }
}
