<?php

namespace Tests\Feature\Portal;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Plans\Models\Plan;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChangePlanTest extends TestCase
{
    use RefreshDatabase;

    public function test_suspended_subscriber_cannot_reactivate_by_changing_plan(): void
    {
        $subscriber = Subscriber::factory()->create(['status' => SubscriberStatus::Suspended]);

        $this->actingAs($subscriber, 'subscriber')
            ->postJson('/api/portal/plan', ['plan_id' => $subscriber->plan_id])
            ->assertStatus(422);

        $this->assertSame(SubscriberStatus::Suspended, $subscriber->fresh()->status);
    }

    public function test_subscriber_with_overdue_invoice_cannot_change_plan(): void
    {
        $subscriber = Subscriber::factory()->create(['status' => SubscriberStatus::Active]);
        Invoice::factory()->for($subscriber)->create(['status' => InvoiceStatus::Overdue, 'paid_at' => null]);

        $this->actingAs($subscriber, 'subscriber')
            ->postJson('/api/portal/plan', ['plan_id' => Plan::factory()->create()->id])
            ->assertStatus(422);
    }

    public function test_cancelled_subscriber_in_good_standing_can_resubscribe(): void
    {
        $subscriber = Subscriber::factory()->create(['status' => SubscriberStatus::Cancelled]);
        $plan = Plan::factory()->create(['price' => 39]);

        $this->actingAs($subscriber, 'subscriber')
            ->postJson('/api/portal/plan', ['plan_id' => $plan->id])
            ->assertOk();

        $subscriber->refresh();
        $this->assertSame(SubscriberStatus::Active, $subscriber->status);
        $this->assertEquals(39, $subscriber->monthly_bill);
    }
}
