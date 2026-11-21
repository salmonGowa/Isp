<?php

namespace App\Domain\Billing\Http\Controllers;

use App\Domain\Billing\Enums\PaymentStatus;
use App\Domain\Billing\Http\Resources\PaymentResource;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;
use App\Domain\Billing\Services\InvoiceSettlement;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Staff review queue for subscriber-submitted payment claims. A claim only
 * moves money on the books once someone has checked it actually arrived.
 */
class PaymentReviewController extends Controller
{
    public function index(Request $request)
    {
        $payments = Payment::query()
            ->with('invoice.subscriber')
            ->where('status', $request->string('status')->isNotEmpty() ? $request->string('status')->toString() : PaymentStatus::Pending->value)
            ->latest()
            ->paginate(min(max($request->integer('per_page', 20), 1), 100));

        return PaymentResource::collection($payments);
    }

    public function confirm(Request $request, Payment $payment, InvoiceSettlement $settlement)
    {
        $payment = DB::transaction(function () use ($request, $payment, $settlement) {
            $payment = Payment::lockForUpdate()->findOrFail($payment->id);
            abort_unless($payment->status === PaymentStatus::Pending, 422, 'Only pending payments can be confirmed.');

            $payment->update([
                'status' => PaymentStatus::Confirmed,
                'reviewed_by' => $request->user('staff')->id,
                'reviewed_at' => now(),
                'paid_at' => now(),
            ]);

            $settlement->apply(Invoice::lockForUpdate()->findOrFail($payment->invoice_id));

            return $payment;
        });

        return new PaymentResource($payment->load('invoice.subscriber'));
    }

    public function reject(Request $request, Payment $payment)
    {
        abort_unless($payment->status === PaymentStatus::Pending, 422, 'Only pending payments can be rejected.');

        $payment->update([
            'status' => PaymentStatus::Rejected,
            'reviewed_by' => $request->user('staff')->id,
            'reviewed_at' => now(),
        ]);

        return new PaymentResource($payment->load('invoice.subscriber'));
    }
}
