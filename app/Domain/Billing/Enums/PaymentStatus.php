<?php

namespace App\Domain\Billing\Enums;

enum PaymentStatus: string
{
    /** Subscriber-submitted claim ("I paid, here's my M-Pesa code") awaiting staff review. */
    case Pending = 'pending';
    /** Money verified as received — counts toward the invoice balance. */
    case Confirmed = 'confirmed';
    /** Claim reviewed and rejected (bad reference, no funds received). */
    case Rejected = 'rejected';
}
