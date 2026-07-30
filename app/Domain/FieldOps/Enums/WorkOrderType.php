<?php

namespace App\Domain\FieldOps\Enums;

enum WorkOrderType: string
{
    case Install = 'install';
    case Repair = 'repair';
    case Maintenance = 'maintenance';
}
