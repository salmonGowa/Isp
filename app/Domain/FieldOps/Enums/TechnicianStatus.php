<?php

namespace App\Domain\FieldOps\Enums;

enum TechnicianStatus: string
{
    case Available = 'available';
    case OnJob = 'on-job';
    case OffDuty = 'off-duty';
}
