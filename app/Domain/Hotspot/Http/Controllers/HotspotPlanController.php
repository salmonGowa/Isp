<?php

namespace App\Domain\Hotspot\Http\Controllers;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use App\Domain\Hotspot\Http\Requests\StoreHotspotPlanRequest;
use App\Domain\Hotspot\Http\Requests\UpdateHotspotPlanRequest;
use App\Domain\Hotspot\Http\Resources\HotspotPlanResource;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HotspotPlanController extends Controller
{
    public function index(Request $request)
    {
        $plans = HotspotPlan::query()
            ->withCount('sessions')
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->orderBy('duration_minutes')
            ->get();

        return HotspotPlanResource::collection($plans);
    }

    public function store(StoreHotspotPlanRequest $request)
    {
        $plan = HotspotPlan::create([
            ...$request->validated(),
            'status' => $request->validated('status') ?? HotspotPlanStatus::Active,
        ]);

        return new HotspotPlanResource($plan->loadCount('sessions'));
    }

    public function show(HotspotPlan $hotspotPlan)
    {
        return new HotspotPlanResource($hotspotPlan->loadCount('sessions'));
    }

    public function update(UpdateHotspotPlanRequest $request, HotspotPlan $hotspotPlan)
    {
        $hotspotPlan->update($request->validated());

        return new HotspotPlanResource($hotspotPlan->loadCount('sessions'));
    }

    public function destroy(HotspotPlan $hotspotPlan)
    {
        $hotspotPlan->delete();

        return response()->noContent();
    }
}
