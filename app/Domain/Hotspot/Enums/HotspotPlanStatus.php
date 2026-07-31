<?php

namespace App\Domain\Hotspot\Enums;

enum HotspotPlanStatus: string
{
    case Active = 'active';
    case Archived = 'archived';
}
