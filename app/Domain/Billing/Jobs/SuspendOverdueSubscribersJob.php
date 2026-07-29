<?php

namespace App\Domain\Billing\Jobs;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Suspend-on-nonpayment automation. Reactivation on payment already lives
 * in ManualPaymentGateway::recordManualPayment() — not duplicated here.
 */
class SuspendOverdueSubscribersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public function handle(): void
    {
        // Invoices past their due date that are still marked "due" are now overdue.
        Invoice::where('status', InvoiceStatus::Due)
            ->where('due_at', '<', now())
            ->update(['status' => InvoiceStatus::Overdue]);

        $graceDays = config('billing.suspend_grace_days');

        // Active subscribers with an overdue invoice move to "overdue" immediately.
        Subscriber::query()
            ->where('status', SubscriberStatus::Active)
            ->whereHas('invoices', fn ($q) => $q->where('status', InvoiceStatus::Overdue))
            ->chunkById(200, function ($subscribers) {
                foreach ($subscribers as $subscriber) {
                    $subscriber->update(['status' => SubscriberStatus::Overdue]);
                }
            });

        // Subscribers who have been overdue for longer than the grace period get suspended,
        // which fires SubscriberSuspended -> RADIUS deprovisioning via the observer/listener.
        Subscriber::query()
            ->where('status', SubscriberStatus::Overdue)
            ->whereHas('invoices', fn ($q) => $q->where('status', InvoiceStatus::Overdue)
                ->where('due_at', '<', now()->subDays($graceDays)))
            ->chunkById(200, function ($subscribers) {
                foreach ($subscribers as $subscriber) {
                    $subscriber->update(['status' => SubscriberStatus::Suspended]);
                }
            });
    }
}
