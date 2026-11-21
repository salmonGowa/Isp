<?php

namespace Tests\Feature\Billing;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Staff\Enums\StaffRole;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffPaymentTest extends TestCase
{
    use RefreshDatabase;

    private Invoice $invoice;

    protected function setUp(): void
    {
        parent::setUp();

        $subscriber = Subscriber::factory()->create(['status' => SubscriberStatus::Overdue]);
        $this->invoice = Invoice::factory()->for($subscriber)->create([
            'amount' => 100,
            'status' => InvoiceStatus::Overdue,
            'due_at' => now()->subDays(2),
            'paid_at' => null,
        ]);

        $this->actingAs(User::factory()->create(['role' => StaffRole::Billing]), 'staff');
    }

    private function pay(float $amount)
    {
        return $this->postJson("/api/staff/invoices/{$this->invoice->id}/payments", ['amount' => $amount]);
    }

    public function test_partial_payment_does_not_settle(): void
    {
        $this->pay(40)->assertSuccessful();

        $this->assertSame(InvoiceStatus::Overdue, $this->invoice->fresh()->status);
        $this->assertSame(SubscriberStatus::Overdue, $this->invoice->subscriber->fresh()->status);
    }

    public function test_payments_adding_up_to_full_amount_settle_and_reactivate(): void
    {
        $this->pay(40)->assertSuccessful();
        $this->pay(60)->assertSuccessful();

        $this->assertSame(InvoiceStatus::Paid, $this->invoice->fresh()->status);
        $this->assertSame(SubscriberStatus::Active, $this->invoice->subscriber->fresh()->status);
    }

    public function test_overpayment_and_paying_a_paid_invoice_are_rejected(): void
    {
        $this->pay(100.01)->assertStatus(422);
        $this->pay(100)->assertSuccessful();
        $this->pay(1)->assertStatus(422);
    }

    public function test_reactivation_waits_for_all_overdue_invoices(): void
    {
        Invoice::factory()->for($this->invoice->subscriber)->create([
            'amount' => 30, 'status' => InvoiceStatus::Overdue, 'due_at' => now()->subDays(30), 'paid_at' => null,
        ]);

        $this->pay(100)->assertSuccessful();

        $this->assertSame(InvoiceStatus::Paid, $this->invoice->fresh()->status);
        $this->assertSame(SubscriberStatus::Overdue, $this->invoice->subscriber->fresh()->status);
    }
}
