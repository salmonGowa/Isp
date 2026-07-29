<?php

namespace App\Domain\Subscribers\Observers;

use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Events\SubscriberActivated;
use App\Domain\Subscribers\Events\SubscriberSuspended;
use App\Domain\Subscribers\Models\Subscriber;

class SubscriberObserver
{
    /**
     * Fire RADIUS-relevant lifecycle events when a subscriber's status changes.
     * Controllers/jobs only ever set `status` and save() — this is the single
     * place that decides what a transition means for network provisioning.
     */
    public function updating(Subscriber $subscriber): void
    {
        if (! $subscriber->isDirty('status')) {
            return;
        }

        $previous = $subscriber->getOriginal('status');
        $current = $subscriber->status;

        if ($current === SubscriberStatus::Active && $previous !== SubscriberStatus::Active) {
            SubscriberActivated::dispatch($subscriber);
        }

        if ($current === SubscriberStatus::Suspended && $previous !== SubscriberStatus::Suspended) {
            SubscriberSuspended::dispatch($subscriber);
        }
    }
}
