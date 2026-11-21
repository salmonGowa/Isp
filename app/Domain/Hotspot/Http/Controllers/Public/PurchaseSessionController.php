<?php

namespace App\Domain\Hotspot\Http\Controllers\Public;

use App\Domain\Hotspot\Enums\HotspotSessionStatus;
use App\Domain\Hotspot\Http\Requests\PurchaseSessionRequest;
use App\Domain\Hotspot\Http\Resources\HotspotSessionResource;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Domain\Hotspot\Models\HotspotSession;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class PurchaseSessionController extends Controller
{
    /**
     * Records a purchase as Pending. The device is NOT authorized here — a
     * typed-in payment reference proves nothing. Access is granted only once
     * the payment is verified (staff activation now; a gateway webhook later).
     */
    public function store(PurchaseSessionRequest $request)
    {
        $mac = $request->validated('mac_address');
        $plan = HotspotPlan::findOrFail($request->validated('hotspot_plan_id'));

        // Serialize purchases per MAC so two concurrent requests can't both pass the checks.
        $session = Cache::lock("hotspot-purchase:{$mac}", 10)->block(5, function () use ($mac, $plan, $request) {
            $activeSession = HotspotSession::where('mac_address', $mac)
                ->where('status', HotspotSessionStatus::Active)
                ->where('expires_at', '>', now())
                ->first();

            abort_if($activeSession, 422, 'This device already has an active pass until '.$activeSession?->expires_at?->format('H:i').'.');

            $pending = HotspotSession::where('mac_address', $mac)
                ->where('status', HotspotSessionStatus::Pending)
                ->where('created_at', '>', now()->subMinutes(config('hotspot.pending_ttl_minutes')))
                ->first();

            abort_if($pending, 422, 'A purchase for this device is already awaiting payment confirmation.');

            // Never trust a client-supplied amount — always the plan's own price.
            // starts_at/expires_at are placeholders until activation sets the real window.
            return HotspotSession::create([
                'mac_address' => $mac,
                'hotspot_plan_id' => $plan->id,
                'amount_paid' => $plan->price,
                'payment_reference' => $request->validated('payment_reference'),
                'status' => HotspotSessionStatus::Pending,
                'starts_at' => now(),
                'expires_at' => now(),
            ]);
        });

        return (new HotspotSessionResource($session->load('plan')))->response()->setStatusCode(202);
    }
}
