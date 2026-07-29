<?php

namespace App\Domain\Billing\Enums;

enum InvoiceStatus: string
{
    case Due = 'due';
    case Paid = 'paid';
    case Overdue = 'overdue';
}
