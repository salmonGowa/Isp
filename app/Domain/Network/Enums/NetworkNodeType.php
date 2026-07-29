<?php

namespace App\Domain\Network\Enums;

enum NetworkNodeType: string
{
    case Olt = 'OLT';
    case Router = 'Router';
    case Tower = 'Tower';
    case Switch = 'Switch';
}
