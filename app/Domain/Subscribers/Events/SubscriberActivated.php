<?php

namespace App\Domain\Subscribers\Events;

use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Foundation\Events\Dispatchable;

class SubscriberActivated
{
    use Dispatchable;

    public function __construct(
        public readonly Subscriber $subscriber,
    ) {}
}
