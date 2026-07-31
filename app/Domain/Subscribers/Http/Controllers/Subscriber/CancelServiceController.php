<?php

namespace App\Domain\Subscribers\Http\Controllers\Subscriber;

use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Http\Resources\SubscriberResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CancelServiceController extends Controller
{
    public function store(Request $request)
    {
        $subscriber = $request->user('subscriber');

        // Not blocked by an outstanding balance — cancelling only stops future
        // billing. Any invoice already issued stays payable through the
        // existing self-pay endpoint even after cancelling.
        $subscriber->update(['status' => SubscriberStatus::Cancelled]);

        return new SubscriberResource($subscriber->load('plan'));
    }
}
