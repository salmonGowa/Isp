<?php

namespace App\Domain\Billing\Services;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Enums\PaymentStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Subscribers\Enums\SubscriberStatus;

/**
 * Single place that decides whether an invoice is settled. An invoice only
 * becomes Paid once *confirmed* payments cover its full amount — pending
 * subscriber claims and partial payments never settle it.
 */
class InvoiceSettlement
{
    public function balance(Invoice $invoice): float
    {
        $paid = (float) $invoice->payments()->where('status', PaymentStatus::Confirmed)->sum('amount');

        return round((float) $invoice->amount - $paid, 2);
    }

    public function apply(Invoice $invoice): Invoice
    {
        if ($invoice->status === InvoiceStatus::Paid || $this->balance($invoice) > 0) {
            return $invoice;
        }

        $invoice->update(['status' => InvoiceStatus::Paid, 'paid_at' => now()]);

        $subscriber = $invoice->subscriber;
        $subscriber->last_payment_at = now();

        // Only reactivate once nothing else is still outstanding.
        $stillOwing = $subscriber->invoices()
            ->whereIn('status', [InvoiceStatus::Due, InvoiceStatus::Overdue])
            ->where('due_at', '<', now())
            ->exists();

        if (! $stillOwing && in_array($subscriber->status, [SubscriberStatus::Overdue, SubscriberStatus::Suspended], true)) {
            $subscriber->status = SubscriberStatus::Active;
        }

        $subscriber->save();

        return $invoice;
    }
}
