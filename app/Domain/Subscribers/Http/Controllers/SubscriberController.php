<?php

namespace App\Domain\Subscribers\Http\Controllers;

use App\Domain\Subscribers\Http\Requests\StoreSubscriberRequest;
use App\Domain\Subscribers\Http\Requests\UpdateSubscriberRequest;
use App\Domain\Subscribers\Http\Resources\SubscriberResource;
use App\Domain\Subscribers\Models\Subscriber;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function index(Request $request)
    {
        $subscribers = Subscriber::query()
            ->with('plan')
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('zone')->isNotEmpty(), fn ($q) => $q->where('zone', $request->string('zone')))
            ->when($request->string('search')->isNotEmpty(), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return SubscriberResource::collection($subscribers);
    }

    public function store(StoreSubscriberRequest $request)
    {
        $subscriber = Subscriber::create($request->validated());

        return new SubscriberResource($subscriber->load('plan'));
    }

    public function show(Subscriber $subscriber)
    {
        return new SubscriberResource($subscriber->load('plan'));
    }

    public function update(UpdateSubscriberRequest $request, Subscriber $subscriber)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $subscriber->update($data);

        return new SubscriberResource($subscriber->load('plan'));
    }

    public function destroy(Subscriber $subscriber)
    {
        $subscriber->delete();

        return response()->noContent();
    }
}
