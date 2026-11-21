<?php

namespace App\Domain\Hotspot\Enums;

enum HotspotSessionStatus: string
{
    /** Purchased but payment not yet verified — device NOT authorized. */
    case Pending = 'pending';
    case Active = 'active';
    case Expired = 'expired';
    case Revoked = 'revoked';
}
