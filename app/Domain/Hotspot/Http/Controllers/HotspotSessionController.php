<?php

namespace App\Domain\Hotspot\Http\Controllers;

use App\Domain\Hotspot\Contracts\HotspotAccessProviderContract;
use App\Domain\Hotspot\Enums\HotspotSessionStatus;
use App\Domain\Hotspot\Http\Requests\StoreHotspotSessionRequest;
use App\Domain\Hotspot\Http\Resources\HotspotSessionResource;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Domain\Hotspot\Models\HotspotSession;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HotspotSessionController extends Controller
{
    public function index(Request $request)
    {
        $sessions = HotspotSession::query()
            ->with('plan')
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('mac_address')->isNotEmpty(), fn ($q) => $q->where('mac_address', $request->string('mac_address')))
            ->latest()
            ->get();

        return HotspotSessionResource::collection($sessions);
    }

    public function store(StoreHotspotSessionRequest $request, HotspotAccessProviderContract $provider)
    {
        $plan = HotspotPlan::findOrFail($request->validated('hotspot_plan_id'));

        // Staff manually granting a session (comps, walk-ins, troubleshooting)
        // — unlike the public purchase flow, this isn't blocked by an existing
        // active session for the same MAC, since staff may legitimately need
        // to override one.
        $session = DB::transaction(fn () => HotspotSession::create([
            'mac_address' => $request->validated('mac_address'),
            'hotspot_plan_id' => $plan->id,
            'amount_paid' => $plan->price,
            'payment_reference' => $request->validated('payment_reference'),
            'status' => HotspotSessionStatus::Active,
            'starts_at' => now(),
            'expires_at' => now()->addMinutes($plan->duration_minutes),
        ]));

        $provider->authorizeDevice($session);

        return new HotspotSessionResource($session->load('plan'));
    }

    public function revoke(HotspotSession $hotspotSession, HotspotAccessProviderContract $provider)
    {
        $hotspotSession->update([
            'status' => HotspotSessionStatus::Revoked,
            'revoked_at' => now(),
        ]);

        $provider->revokeDevice($hotspotSession);

        return new HotspotSessionResource($hotspotSession->load('plan'));
    }
}
