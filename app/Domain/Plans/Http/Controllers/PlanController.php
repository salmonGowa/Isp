<?php

namespace App\Domain\Plans\Http\Controllers;

use App\Domain\Plans\Enums\PlanStatus;
use App\Domain\Plans\Http\Requests\StorePlanRequest;
use App\Domain\Plans\Http\Requests\UpdatePlanRequest;
use App\Domain\Plans\Http\Resources\PlanResource;
use App\Domain\Plans\Models\Plan;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        $plans = Plan::query()
            ->withCount('subscribers')
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->get();

        return PlanResource::collection($plans);
    }

    public function store(StorePlanRequest $request)
    {
        $plan = Plan::create([
            ...$request->validated(),
            'status' => $request->validated('status') ?? PlanStatus::Active,
        ]);

        return new PlanResource($plan->loadCount('subscribers'));
    }

    public function show(Plan $plan)
    {
        return new PlanResource($plan->loadCount('subscribers'));
    }

    public function update(UpdatePlanRequest $request, Plan $plan)
    {
        $plan->update($request->validated());

        return new PlanResource($plan->loadCount('subscribers'));
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return response()->noContent();
    }
}
