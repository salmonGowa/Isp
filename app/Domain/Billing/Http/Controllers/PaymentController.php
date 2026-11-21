<?php

namespace App\Domain\Billing\Http\Controllers;

use App\Domain\Billing\Contracts\PaymentGatewayContract;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Http\Requests\RecordPaymentRequest;
use App\Domain\Billing\Http\Resources\PaymentResource;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Services\InvoiceSettlement;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    public function store(RecordPaymentRequest $request, Invoice $invoice, PaymentGatewayContract $gateway, InvoiceSettlement $settlement)
    {
        abort_if($invoice->status === InvoiceStatus::Paid, 422, 'Invoice is already paid.');

        $amount = (float) $request->validated('amount');
        $balance = $settlement->balance($invoice);

        abort_if($amount > $balance, 422, sprintf('Amount exceeds the outstanding balance of %.2f.', $balance));

        $payment = $gateway->recordManualPayment($invoice, $amount, $request->validated('reference'));

        return new PaymentResource($payment);
    }
}
