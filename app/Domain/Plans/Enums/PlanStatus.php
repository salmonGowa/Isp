<?php

namespace App\Domain\Plans\Enums;

enum PlanStatus: string
{
    case Active = 'active';
    case Archived = 'archived';
}
