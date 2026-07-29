<?php

namespace App\Domain\Billing\Http\Controllers;

use App\Domain\Billing\Contracts\PaymentGatewayContract;
use App\Domain\Billing\Http\Requests\RecordPaymentRequest;
use App\Domain\Billing\Http\Resources\PaymentResource;
use App\Domain\Billing\Models\Invoice;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    public function store(RecordPaymentRequest $request, Invoice $invoice, PaymentGatewayContract $gateway)
    {
        $payment = $gateway->recordManualPayment(
            $invoice,
            (float) $request->validated('amount'),
            $request->validated('reference'),
        );

        return new PaymentResource($payment);
    }
}
