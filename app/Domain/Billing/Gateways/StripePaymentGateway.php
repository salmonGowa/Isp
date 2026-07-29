<?php

namespace App\Domain\Billing\Gateways;

use App\Domain\Billing\Contracts\PaymentGatewayContract;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;

/**
 * Stub extension point — not bound in the container, not usable yet.
 *
 * TODO to wire this up for real:
 *  - composer require stripe/stripe-php
 *  - charge(): create a PaymentIntent against $invoice->subscriber->email /
 *    a saved Stripe customer id (would need a `stripe_customer_id` column
 *    on subscribers), confirm with $options['payment_method'].
 *  - recordManualPayment(): probably not applicable for Stripe (payments
 *    arrive via webhook instead) — likely only used to reconcile.
 *  - refund(): call Stripe's refund API against the payment's `reference`
 *    (the Stripe PaymentIntent/charge id).
 *  - Add a webhook route + controller to receive `payment_intent.succeeded`
 *    /`charge.refunded` events and update Invoice/Payment accordingly.
 *  - Swap the binding in BillingServiceProvider once ready.
 */
class StripePaymentGateway implements PaymentGatewayContract
{
    public function charge(Invoice $invoice, array $options = []): Payment
    {
        throw new \RuntimeException('StripePaymentGateway is not implemented yet.');
    }

    public function recordManualPayment(Invoice $invoice, float $amount, ?string $reference = null): Payment
    {
        throw new \RuntimeException('StripePaymentGateway is not implemented yet.');
    }

    public function refund(Payment $payment): bool
    {
        throw new \RuntimeException('StripePaymentGateway is not implemented yet.');
    }
}
