<?php

namespace App\Domain\Billing\Contracts;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;

interface PaymentGatewayContract
{
    /**
     * Actively charge a payment method for an invoice (e.g. a saved card via
     * a real gateway). Not every implementation supports this — a receipt-only
     * gateway (like the manual one) should throw.
     */
    public function charge(Invoice $invoice, array $options = []): Payment;

    /**
     * Record a payment that already happened outside this system (cash, bank
     * transfer, an admin manually confirming a payment was received).
     */
    public function recordManualPayment(Invoice $invoice, float $amount, ?string $reference = null): Payment;

    /**
     * Refund a previously recorded payment. Returns whether the refund succeeded.
     */
    public function refund(Payment $payment): bool;
}
