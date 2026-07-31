<?php

namespace App\Domain\Subscribers\Http\Controllers\Subscriber;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Http\Requests\Subscriber\DeleteAccountRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;

class DeleteAccountController extends Controller
{
    public function destroy(DeleteAccountRequest $request)
    {
        $subscriber = $request->user('subscriber');

        abort_if(
            $subscriber->invoices()->whereIn('status', [InvoiceStatus::Due, InvoiceStatus::Overdue])->exists(),
            422,
            'Settle any outstanding invoices before deleting your account.',
        );

        // This system never hard-deletes a subscriber — invoices, payments,
        // and tickets must stay intact for accounting/support history. So
        // "delete account" anonymizes and closes the account instead: PII is
        // scrubbed and the password is randomized so login becomes impossible,
        // while every historical record stays correctly attributed to this id.
        $subscriber->update([
            'status' => SubscriberStatus::Cancelled,
            'name' => 'Deleted Subscriber',
            'email' => "deleted-{$subscriber->id}-".now()->timestamp.'@deleted.invalid',
            'phone' => null,
            'service_address' => 'N/A',
            'plan_id' => null,
            'monthly_bill' => 0,
            'password' => Str::random(40),
        ]);

        // Deliberately doesn't touch the session here — the frontend calls its
        // existing (hook-wrapped) logout right after a successful delete, so
        // logout logic isn't duplicated across two controllers.
        return response()->noContent();
    }
}
