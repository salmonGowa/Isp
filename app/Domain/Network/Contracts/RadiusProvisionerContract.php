<?php

namespace App\Domain\Network\Contracts;

use App\Domain\Subscribers\Models\Subscriber;

interface RadiusProvisionerContract
{
    /**
     * Create/enable the subscriber's RADIUS user so their equipment can authenticate.
     */
    public function provisionForActivation(Subscriber $subscriber): void;

    /**
     * Disable the subscriber's RADIUS user, cutting off network access.
     */
    public function deprovisionForSuspension(Subscriber $subscriber): void;
}
