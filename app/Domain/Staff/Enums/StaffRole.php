<?php

namespace App\Domain\Staff\Enums;

enum StaffRole: string
{
    case Admin = 'admin';
    case Billing = 'billing';
    case Noc = 'noc';
    case Support = 'support';
    case Technician = 'technician';
}
