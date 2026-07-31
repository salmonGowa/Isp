<?php

namespace App\Domain\Hotspot\Enums;

enum HotspotSessionStatus: string
{
    case Active = 'active';
    case Expired = 'expired';
    case Revoked = 'revoked';
}
