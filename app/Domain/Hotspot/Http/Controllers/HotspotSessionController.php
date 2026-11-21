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
            ->limit(500)
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

    /**
     * Staff verified the payment for a pending public purchase — start the
     * pass now (full duration from activation) and authorize the device.
     */
    public function activate(HotspotSession $hotspotSession, HotspotAccessProviderContract $provider)
    {
        abort_unless($hotspotSession->status === HotspotSessionStatus::Pending, 422, 'Only pending sessions can be activated.');

        $minutes = $hotspotSession->plan?->duration_minutes;
        abort_unless($minutes, 422, 'This session\'s pass no longer exists.');

        $hotspotSession->update([
            'status' => HotspotSessionStatus::Active,
            'starts_at' => now(),
            'expires_at' => now()->addMinutes($minutes),
        ]);

        $provider->authorizeDevice($hotspotSession);

        return new HotspotSessionResource($hotspotSession->load('plan'));
    }

    public function revoke(HotspotSession $hotspotSession, HotspotAccessProviderContract $provider)
    {
        abort_unless(in_array($hotspotSession->status, [HotspotSessionStatus::Active, HotspotSessionStatus::Pending], true), 422, 'Session is not active.');

        $wasActive = $hotspotSession->status === HotspotSessionStatus::Active;

        $hotspotSession->update([
            'status' => HotspotSessionStatus::Revoked,
            'revoked_at' => now(),
        ]);

        if ($wasActive) {
            $provider->revokeDevice($hotspotSession);
        }

        return new HotspotSessionResource($hotspotSession->load('plan'));
    }
}
