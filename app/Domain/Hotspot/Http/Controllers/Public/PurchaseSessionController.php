<?php

namespace App\Domain\Hotspot\Http\Controllers\Public;

use App\Domain\Hotspot\Contracts\HotspotAccessProviderContract;
use App\Domain\Hotspot\Enums\HotspotSessionStatus;
use App\Domain\Hotspot\Http\Requests\PurchaseSessionRequest;
use App\Domain\Hotspot\Http\Resources\HotspotSessionResource;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Domain\Hotspot\Models\HotspotSession;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PurchaseSessionController extends Controller
{
    public function store(PurchaseSessionRequest $request, HotspotAccessProviderContract $provider)
    {
        $mac = $request->validated('mac_address');
        $plan = HotspotPlan::findOrFail($request->validated('hotspot_plan_id'));

        $activeSession = HotspotSession::where('mac_address', $mac)
            ->where('status', HotspotSessionStatus::Active)
            ->where('expires_at', '>', now())
            ->first();

        abort_if($activeSession, 422, 'This device already has an active pass until '.$activeSession?->expires_at?->format('H:i').'.');

        // Deliberately never trust a client-supplied amount here (same
        // precedent as the subscriber self-pay flow) — always charge the
        // plan's own known price, not anything the request could tamper with.
        $session = DB::transaction(fn () => HotspotSession::create([
            'mac_address' => $mac,
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
}
