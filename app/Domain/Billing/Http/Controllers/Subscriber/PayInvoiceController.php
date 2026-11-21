<?php

namespace App\Domain\Billing\Http\Controllers\Subscriber;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Enums\PaymentStatus;
use App\Domain\Billing\Http\Requests\Subscriber\PayInvoiceRequest;
use App\Domain\Billing\Http\Resources\PaymentResource;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Services\InvoiceSettlement;
use App\Http\Controllers\Controller;

class PayInvoiceController extends Controller
{
    public function store(PayInvoiceRequest $request, Invoice $invoice, InvoiceSettlement $settlement)
    {
        abort_unless($invoice->subscriber_id === $request->user('subscriber')->id, 403);
        abort_if($invoice->status === InvoiceStatus::Paid, 422, 'Invoice is already paid.');
        abort_if(
            $invoice->payments()->where('status', PaymentStatus::Pending)->exists(),
            422,
            'A payment for this invoice is already awaiting confirmation.',
        );

        // A subscriber saying "I paid" is a claim, not money received. It is
        // recorded as Pending and only settles the invoice once billing staff
        // confirm it (PaymentReviewController). Amount is always the server's
        // own outstanding balance — never client-supplied.
        $payment = $invoice->payments()->create([
            'tenant_id' => $invoice->tenant_id,
            'amount' => $settlement->balance($invoice),
            'method' => 'manual',
            'reference' => $request->validated('reference'),
            'status' => PaymentStatus::Pending,
        ]);

        return (new PaymentResource($payment))->response()->setStatusCode(202);
    }
}
