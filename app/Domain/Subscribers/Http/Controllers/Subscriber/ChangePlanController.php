<?php

namespace App\Domain\Subscribers\Http\Controllers\Subscriber;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Plans\Models\Plan;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Http\Requests\Subscriber\ChangePlanRequest;
use App\Domain\Subscribers\Http\Resources\SubscriberResource;
use App\Http\Controllers\Controller;

class ChangePlanController extends Controller
{
    public function store(ChangePlanRequest $request)
    {
        $subscriber = $request->user('subscriber');
        $plan = Plan::findOrFail($request->validated('plan_id'));

        // Changing plan must never be a way around non-payment suspension.
        abort_if(
            in_array($subscriber->status, [SubscriberStatus::Overdue, SubscriberStatus::Suspended], true)
                || $subscriber->invoices()->where('status', InvoiceStatus::Overdue)->exists(),
            422,
            'Settle your overdue balance before changing plans.',
        );

        // One code path covers upgrade, downgrade, and resubscribing after a
        // cancellation (the guard above keeps it from undoing a suspension). No
        // proration is computed anywhere in this system: the new monthly_bill
        // simply applies starting with the next invoice GenerateInvoicesJob issues.
        $subscriber->update([
            'plan_id' => $plan->id,
            'monthly_bill' => $plan->price,
            'status' => SubscriberStatus::Active,
        ]);

        return new SubscriberResource($subscriber->load('plan'));
    }
}
