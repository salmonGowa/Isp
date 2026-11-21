<?php

namespace Tests\Feature\Auth;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Staff\Enums\StaffRole;
use App\Domain\Subscribers\Models\Subscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class StaffRoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private function as(StaffRole $role): static
    {
        return $this->actingAs(User::factory()->create(['role' => $role]), 'staff');
    }

    public static function allRoles(): array
    {
        return array_map(fn ($r) => [$r], StaffRole::cases());
    }

    #[DataProvider('allRoles')]
    public function test_every_role_can_read(StaffRole $role): void
    {
        foreach (['/api/staff/subscribers', '/api/staff/invoices', '/api/staff/plans', '/api/staff/tickets', '/api/staff/network-nodes', '/api/staff/work-orders'] as $uri) {
            $this->as($role)->getJson($uri)->assertOk();
        }
    }

    public function test_only_billing_and_admin_can_record_payments(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10, 'status' => 'due', 'paid_at' => null]);

        foreach ([StaffRole::Technician, StaffRole::Support, StaffRole::Noc] as $role) {
            $this->as($role)->postJson("/api/staff/invoices/{$invoice->id}/payments", ['amount' => 1])->assertForbidden();
        }

        $this->as(StaffRole::Billing)->postJson("/api/staff/invoices/{$invoice->id}/payments", ['amount' => 1])->assertCreated();
    }

    public function test_only_admin_can_delete_subscribers_and_invoices(): void
    {
        $subscriber = Subscriber::factory()->create();
        $invoice = Invoice::factory()->create();

        $this->as(StaffRole::Billing)->deleteJson("/api/staff/subscribers/{$subscriber->id}")->assertForbidden();
        $this->as(StaffRole::Billing)->deleteJson("/api/staff/invoices/{$invoice->id}")->assertForbidden();

        $this->as(StaffRole::Admin)->deleteJson("/api/staff/invoices/{$invoice->id}")->assertNoContent();
    }

    public function test_technician_cannot_edit_plans_or_subscribers(): void
    {
        $subscriber = Subscriber::factory()->create();

        $this->as(StaffRole::Technician)->postJson('/api/staff/plans', [])->assertForbidden();
        $this->as(StaffRole::Technician)->putJson("/api/staff/subscribers/{$subscriber->id}", ['name' => 'x'])->assertForbidden();
    }

    public function test_per_page_is_capped(): void
    {
        Invoice::factory()->count(3)->create();

        $this->as(StaffRole::Admin)->getJson('/api/staff/invoices?per_page=100000')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 100);
    }
}
