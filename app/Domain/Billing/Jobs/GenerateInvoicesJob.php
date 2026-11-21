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
 * Recurring billing run — creates the next monthly invoice for every active
 * subscriber whose last invoice was issued a month or more ago.
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

                    // Bill once per calendar month from the last issue date. (Gating
                    // on due_at billed every `invoice_due_days` — i.e. twice a month.)
                    if ($latestInvoice && $latestInvoice->issued_at?->copy()->addMonthNoOverflow()->isFuture()) {
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
