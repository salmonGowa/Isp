<?php

namespace App\Domain\Hotspot\Http\Controllers\Public;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use App\Domain\Hotspot\Http\Resources\HotspotPlanResource;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Http\Controllers\Controller;

class HotspotPlanController extends Controller
{
    public function index()
    {
        // Public, unauthenticated — the status filter is never client-supplied,
        // a visitor can only ever see the passes they could actually buy.
        $plans = HotspotPlan::query()->where('status', HotspotPlanStatus::Active)->orderBy('duration_minutes')->get();

        return HotspotPlanResource::collection($plans);
    }
}
