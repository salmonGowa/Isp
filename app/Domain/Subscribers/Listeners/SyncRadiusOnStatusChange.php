<?php

namespace App\Domain\Subscribers\Listeners;

use App\Domain\Network\Contracts\RadiusProvisionerContract;
use App\Domain\Subscribers\Events\SubscriberActivated;
use App\Domain\Subscribers\Events\SubscriberSuspended;
use Illuminate\Contracts\Queue\ShouldQueue;

class SyncRadiusOnStatusChange implements ShouldQueue
{
    /**
     * Constructor injection, not method-parameter injection — queued
     * listeners are re-invoked as `$handler->{$method}(...$data)` after
     * coming off the queue, with no container-assisted argument resolution,
     * so any dependency has to come in through the constructor instead.
     */
    public function __construct(
        private readonly RadiusProvisionerContract $radius,
    ) {}

    public function handleSubscriberActivated(SubscriberActivated $event): void
    {
        $this->radius->provisionForActivation($event->subscriber);
    }

    public function handleSubscriberSuspended(SubscriberSuspended $event): void
    {
        $this->radius->deprovisionForSuspension($event->subscriber);
    }
}
