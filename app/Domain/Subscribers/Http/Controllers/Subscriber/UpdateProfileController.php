<?php

namespace App\Domain\Subscribers\Http\Controllers\Subscriber;

use App\Domain\Subscribers\Http\Requests\Subscriber\UpdateProfileRequest;
use App\Domain\Subscribers\Http\Resources\SubscriberResource;
use App\Http\Controllers\Controller;

class UpdateProfileController extends Controller
{
    public function store(UpdateProfileRequest $request)
    {
        $subscriber = $request->user('subscriber');
        $subscriber->update($request->validated());

        return new SubscriberResource($subscriber->load('plan'));
    }
}
