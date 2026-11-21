<?php

namespace Tests\Feature\Billing;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Jobs\GenerateInvoicesJob;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GenerateInvoicesJobTest extends TestCase
{
    use RefreshDatabase;

    private function subscriberInvoicedDaysAgo(int $days): Subscriber
    {
        $subscriber = Subscriber::factory()->create(['status' => SubscriberStatus::Active, 'monthly_bill' => 45]);
        Invoice::factory()->for($subscriber)->create([
            'status' => InvoiceStatus::Paid,
            'issued_at' => now()->subDays($days),
            'due_at' => now()->subDays($days)->addDays(14),
        ]);

        return $subscriber;
    }

    public function test_does_not_rebill_within_the_month_after_due_date_passes(): void
    {
        $subscriber = $this->subscriberInvoicedDaysAgo(20); // due date passed 6 days ago

        (new GenerateInvoicesJob)->handle();

        $this->assertSame(1, $subscriber->invoices()->count());
    }

    public function test_bills_once_a_month_has_passed(): void
    {
        $subscriber = $this->subscriberInvoicedDaysAgo(32);

        (new GenerateInvoicesJob)->handle();
        (new GenerateInvoicesJob)->handle(); // idempotent on re-run

        $this->assertSame(2, $subscriber->invoices()->count());
        $this->assertEquals($subscriber->fresh()->monthly_bill, $subscriber->invoices()->latest('issued_at')->first()->amount);
    }

    public function test_bills_new_subscribers_with_no_invoice(): void
    {
        $subscriber = Subscriber::factory()->create(['status' => SubscriberStatus::Active]);

        (new GenerateInvoicesJob)->handle();

        $this->assertSame(1, $subscriber->invoices()->count());
    }
}
