<?php

namespace App\Domain\Subscribers\Enums;

enum SubscriberStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Overdue = 'overdue';
    case Cancelled = 'cancelled';
}
