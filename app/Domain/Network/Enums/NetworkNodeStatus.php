<?php

namespace App\Domain\Network\Enums;

enum NetworkNodeStatus: string
{
    case Online = 'online';
    case Degraded = 'degraded';
    case Offline = 'offline';
}
