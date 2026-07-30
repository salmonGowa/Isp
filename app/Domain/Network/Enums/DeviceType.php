<?php

namespace App\Domain\Network\Enums;

enum DeviceType: string
{
    case Tv = 'tv';
    case Phone = 'phone';
    case Laptop = 'laptop';
    case Router = 'router';
}
