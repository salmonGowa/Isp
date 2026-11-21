<?php

namespace App\Domain\Billing\Gateways;

use App\Domain\Billing\Contracts\PaymentGatewayContract;
use App\Domain\Billing\Enums\PaymentStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;
use App\Domain\Billing\Services\InvoiceSettlement;
use Illuminate\Support\Facades\DB;

/**
 * The only payment gateway bound for MVP — records payments that were
 * collected outside the system (cash, bank transfer, an admin confirming
 * receipt). It never moves money itself.
 */
class ManualPaymentGateway implements PaymentGatewayContract
{
    public function __construct(private InvoiceSettlement $settlement) {}

    public function charge(Invoice $invoice, array $options = []): Payment
    {
        throw new \RuntimeException(
            'ManualPaymentGateway cannot actively charge a payment method; use recordManualPayment() to record a payment collected outside the system.'
        );
    }

    /**
     * Records a *confirmed* payment. Only trusted staff should reach this —
     * subscriber self-reported payments go in as Pending instead (see
     * PayInvoiceController) and are confirmed via PaymentReviewController.
     */
    public function recordManualPayment(Invoice $invoice, float $amount, ?string $reference = null): Payment
    {
        return DB::transaction(function () use ($invoice, $amount, $reference) {
            $invoice = Invoice::lockForUpdate()->findOrFail($invoice->id);

            $payment = $invoice->payments()->create([
                'tenant_id' => $invoice->tenant_id,
                'amount' => $amount,
                'method' => 'manual',
                'reference' => $reference,
                'status' => PaymentStatus::Confirmed,
                'reviewed_by' => auth('staff')->id(),
                'reviewed_at' => now(),
                'paid_at' => now(),
            ]);

            $this->settlement->apply($invoice);

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
