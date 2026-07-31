<?php

namespace App\Domain\Plans\Http\Controllers\Subscriber;

use App\Domain\Plans\Enums\PlanStatus;
use App\Domain\Plans\Http\Resources\PlanResource;
use App\Domain\Plans\Models\Plan;
use App\Http\Controllers\Controller;

class PlanController extends Controller
{
    public function index()
    {
        // Unlike the staff-facing index, the status filter is never
        // client-supplied here — a subscriber can only ever see plans they
        // could actually switch to.
        $plans = Plan::query()->where('status', PlanStatus::Active)->orderBy('name')->get();

        return PlanResource::collection($plans);
    }
}
