<?php

namespace Tests\Feature\Billing;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Enums\PaymentStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;
use App\Domain\Staff\Enums\StaffRole;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriberSelfPayTest extends TestCase
{
    use RefreshDatabase;

    private Subscriber $subscriber;

    private Invoice $invoice;

    protected function setUp(): void
    {
        parent::setUp();

        $this->subscriber = Subscriber::factory()->create(['status' => SubscriberStatus::Suspended]);
        $this->invoice = Invoice::factory()->for($this->subscriber)->create([
            'amount' => 50,
            'status' => InvoiceStatus::Overdue,
            'issued_at' => now()->subDays(40),
            'due_at' => now()->subDays(26),
            'paid_at' => null,
        ]);
    }

    private function billingStaff(): User
    {
        return User::factory()->create(['role' => StaffRole::Billing]);
    }

    public function test_self_pay_only_records_a_pending_claim(): void
    {
        $this->actingAs($this->subscriber, 'subscriber')
            ->postJson("/api/portal/invoices/{$this->invoice->id}/pay", ['reference' => 'MPESA1'])
            ->assertStatus(202)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.amount', 50);

        $this->assertSame(InvoiceStatus::Overdue, $this->invoice->fresh()->status);
        $this->assertSame(SubscriberStatus::Suspended, $this->subscriber->fresh()->status);
    }

    public function test_reference_required_and_duplicates_blocked(): void
    {
        $this->actingAs($this->subscriber, 'subscriber');

        $this->postJson("/api/portal/invoices/{$this->invoice->id}/pay")->assertJsonValidationErrors('reference');
        $this->postJson("/api/portal/invoices/{$this->invoice->id}/pay", ['reference' => 'A'])->assertStatus(202);
        $this->postJson("/api/portal/invoices/{$this->invoice->id}/pay", ['reference' => 'B'])->assertStatus(422);
    }

    public function test_cannot_pay_someone_elses_invoice(): void
    {
        $this->actingAs(Subscriber::factory()->create(), 'subscriber')
            ->postJson("/api/portal/invoices/{$this->invoice->id}/pay", ['reference' => 'X'])
            ->assertForbidden();
    }

    public function test_staff_confirmation_settles_invoice_and_reactivates(): void
    {
        $this->actingAs($this->subscriber, 'subscriber')
            ->postJson("/api/portal/invoices/{$this->invoice->id}/pay", ['reference' => 'MPESA1']);
        $payment = Payment::sole();

        $staff = $this->billingStaff();
        $this->actingAs($staff, 'staff')
            ->getJson('/api/staff/payments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $payment->id);

        $this->actingAs($staff, 'staff')
            ->postJson("/api/staff/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertSame(InvoiceStatus::Paid, $this->invoice->fresh()->status);
        $this->assertSame(SubscriberStatus::Active, $this->subscriber->fresh()->status);
        $this->assertSame($staff->id, $payment->fresh()->reviewed_by);

        $this->actingAs($staff, 'staff')->postJson("/api/staff/payments/{$payment->id}/confirm")->assertStatus(422);
    }

    public function test_rejection_leaves_invoice_unpaid(): void
    {
        $this->actingAs($this->subscriber, 'subscriber')
            ->postJson("/api/portal/invoices/{$this->invoice->id}/pay", ['reference' => 'FAKE']);

        $this->actingAs($this->billingStaff(), 'staff')
            ->postJson('/api/staff/payments/'.Payment::sole()->id.'/reject')
            ->assertOk();

        $this->assertSame(PaymentStatus::Rejected, Payment::sole()->status);
        $this->assertSame(InvoiceStatus::Overdue, $this->invoice->fresh()->status);
        $this->assertSame(SubscriberStatus::Suspended, $this->subscriber->fresh()->status);
    }

    public function test_support_staff_cannot_confirm_payments(): void
    {
        $this->actingAs($this->subscriber, 'subscriber')
            ->postJson("/api/portal/invoices/{$this->invoice->id}/pay", ['reference' => 'MPESA1']);

        $this->actingAs(User::factory()->create(['role' => StaffRole::Support]), 'staff')
            ->postJson('/api/staff/payments/'.Payment::sole()->id.'/confirm')
            ->assertForbidden();
    }
}
