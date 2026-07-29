<?php

namespace App\Domain\Support\Enums;

enum TicketStatus: string
{
    case Open = 'open';
    case InProgress = 'in-progress';
    case Resolved = 'resolved';
}
