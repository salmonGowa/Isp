<?php

namespace App\Domain\Billing\Http\Controllers\Subscriber;

use App\Domain\Billing\Contracts\PaymentGatewayContract;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Http\Requests\Subscriber\PayInvoiceRequest;
use App\Domain\Billing\Http\Resources\PaymentResource;
use App\Domain\Billing\Models\Invoice;
use App\Http\Controllers\Controller;

class PayInvoiceController extends Controller
{
    public function store(PayInvoiceRequest $request, Invoice $invoice, PaymentGatewayContract $gateway)
    {
        abort_unless($invoice->subscriber_id === $request->user('subscriber')->id, 403);
        abort_if($invoice->status === InvoiceStatus::Paid, 422, 'Invoice is already paid.');

        // Deliberately never trust a client-supplied amount here (unlike the
        // staff-facing RecordPaymentRequest, which is a trusted internal actor
        // recording an externally-collected amount) — always settle the
        // invoice's own amount, so a subscriber can't tamper with what gets paid.
        $payment = $gateway->recordManualPayment(
            $invoice,
            (float) $invoice->amount,
            $request->validated('reference'),
        );

        return new PaymentResource($payment);
    }
}
