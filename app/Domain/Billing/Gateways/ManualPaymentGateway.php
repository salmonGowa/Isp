<?php

namespace App\Domain\Billing\Gateways;

use App\Domain\Billing\Contracts\PaymentGatewayContract;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use Illuminate\Support\Facades\DB;

/**
 * The only payment gateway bound for MVP — records payments that were
 * collected outside the system (cash, bank transfer, an admin confirming
 * receipt). It never moves money itself.
 */
class ManualPaymentGateway implements PaymentGatewayContract
{
    public function charge(Invoice $invoice, array $options = []): Payment
    {
        throw new \RuntimeException(
            'ManualPaymentGateway cannot actively charge a payment method; use recordManualPayment() to record a payment collected outside the system.'
        );
    }

    public function recordManualPayment(Invoice $invoice, float $amount, ?string $reference = null): Payment
    {
        return DB::transaction(function () use ($invoice, $amount, $reference) {
            $payment = $invoice->payments()->create([
                'amount' => $amount,
                'method' => 'manual',
                'reference' => $reference,
                'paid_at' => now(),
            ]);

            $invoice->update([
                'status' => InvoiceStatus::Paid,
                'paid_at' => now(),
            ]);

            $subscriber = $invoice->subscriber;
            $subscriber->last_payment_at = now();

            if (in_array($subscriber->status, [SubscriberStatus::Overdue, SubscriberStatus::Suspended], true)) {
                $subscriber->status = SubscriberStatus::Active;
            }

            $subscriber->save();

            return $payment;
        });
    }

    public function refund(Payment $payment): bool
    {
        // TODO: refunds are out of scope for this pass. A real implementation
        // would reverse the invoice status and record a negative payment/void.
        return false;
    }
}
