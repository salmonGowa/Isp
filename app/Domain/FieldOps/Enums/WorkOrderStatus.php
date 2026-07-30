<?php

namespace App\Domain\FieldOps\Enums;

enum WorkOrderStatus: string
{
    case Scheduled = 'scheduled';
    case InProgress = 'in-progress';
    case Completed = 'completed';
}
