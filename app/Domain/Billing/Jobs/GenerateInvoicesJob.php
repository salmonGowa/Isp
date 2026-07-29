<?php

namespace App\Domain\Billing\Jobs;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Recurring billing run — creates the next invoice for every active
 * subscriber who doesn't already have a current, unexpired one.
 */
class GenerateInvoicesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public string $queue = 'invoices';

    public function handle(): void
    {
        Subscriber::query()
            ->where('status', SubscriberStatus::Active)
            ->chunkById(200, function ($subscribers) {
                foreach ($subscribers as $subscriber) {
                    $latestInvoice = $subscriber->invoices()->latest('issued_at')->first();

                    if ($latestInvoice && $latestInvoice->due_at?->isFuture()) {
                        continue;
                    }

                    $subscriber->invoices()->create([
                        'tenant_id' => $subscriber->tenant_id,
                        'amount' => $subscriber->monthly_bill,
                        'status' => InvoiceStatus::Due,
                        'issued_at' => now(),
                        'due_at' => now()->addDays(config('billing.invoice_due_days')),
                    ]);
                }
            });
    }
}
