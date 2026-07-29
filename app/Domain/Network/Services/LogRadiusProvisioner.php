<?php

namespace App\Domain\Network\Services;

use App\Domain\Network\Contracts\RadiusProvisionerContract;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Support\Facades\Log;

/**
 * No-op stand-in for a real FreeRADIUS integration. FreeRADIUS isn't running
 * in this environment yet — this just logs intent so the observer/event/job
 * chain that will eventually call the real thing can be built and tested now.
 *
 * TODO: replace with a driver that talks to FreeRADIUS (e.g. writing radcheck/
 * radreply rows on the `radius` database connection, or hitting its REST API
 * if using a management layer like daloRADIUS) once FreeRADIUS is deployed.
 */
class LogRadiusProvisioner implements RadiusProvisionerContract
{
    public function provisionForActivation(Subscriber $subscriber): void
    {
        Log::info('[RADIUS-STUB] Would provision RADIUS user for activation', [
            'subscriber_id' => $subscriber->id,
            'email' => $subscriber->email,
            'plan_id' => $subscriber->plan_id,
        ]);
    }

    public function deprovisionForSuspension(Subscriber $subscriber): void
    {
        Log::info('[RADIUS-STUB] Would deprovision RADIUS user for suspension', [
            'subscriber_id' => $subscriber->id,
            'email' => $subscriber->email,
        ]);
    }
}
