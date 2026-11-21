<?php

namespace Tests\Feature\Hotspot;

use App\Domain\Hotspot\Contracts\HotspotAccessProviderContract;
use App\Domain\Hotspot\Enums\HotspotSessionStatus;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Domain\Hotspot\Models\HotspotSession;
use App\Domain\Staff\Enums\StaffRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class HotspotPurchaseTest extends TestCase
{
    use RefreshDatabase;

    private const MAC = 'AA:BB:CC:DD:EE:FF';

    private function purchase(array $overrides = [])
    {
        return $this->postJson('/api/hotspot/purchase', array_merge([
            'mac_address' => self::MAC,
            'hotspot_plan_id' => HotspotPlan::factory()->create()->id,
            'payment_reference' => 'QWE123RTY',
        ], $overrides));
    }

    public function test_purchase_is_pending_and_does_not_authorize_the_device(): void
    {
        $provider = Mockery::mock(HotspotAccessProviderContract::class);
        $provider->shouldNotReceive('authorizeDevice');
        $this->app->instance(HotspotAccessProviderContract::class, $provider);

        $this->purchase()->assertStatus(202)->assertJsonPath('data.status', 'pending');

        $this->assertSame(HotspotSessionStatus::Pending, HotspotSession::sole()->status);
    }

    public function test_payment_reference_is_required(): void
    {
        $this->purchase(['payment_reference' => null])->assertJsonValidationErrors('payment_reference');
    }

    public function test_mac_is_normalized_and_duplicate_pending_purchase_is_blocked(): void
    {
        $this->purchase(['mac_address' => 'aa:bb:cc:dd:ee:ff'])->assertStatus(202);
        $this->purchase()->assertStatus(422);

        $this->assertSame(self::MAC, HotspotSession::sole()->mac_address);
    }

    public function test_signature_is_enforced_when_secret_configured(): void
    {
        config(['hotspot.mac_signing_secret' => 'router-secret']);

        $this->purchase()->assertJsonValidationErrors('signature');
        $this->purchase(['signature' => str_repeat('0', 64)])->assertJsonValidationErrors('mac_address');

        $this->purchase(['signature' => hash_hmac('sha256', self::MAC, 'router-secret')])->assertStatus(202);
    }

    public function test_staff_activation_authorizes_device_with_full_duration(): void
    {
        $this->purchase()->assertStatus(202);
        $session = HotspotSession::sole();

        $provider = Mockery::mock(HotspotAccessProviderContract::class);
        $provider->shouldReceive('authorizeDevice')->once();
        $this->app->instance(HotspotAccessProviderContract::class, $provider);

        $this->travel(10)->minutes();

        $this->actingAs(User::factory()->create(['role' => StaffRole::Support]), 'staff')
            ->postJson("/api/staff/hotspot-sessions/{$session->id}/activate")
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $session->refresh();
        $this->assertEqualsWithDelta(60, $session->starts_at->diffInMinutes($session->expires_at), 0.01);
        $this->assertTrue($session->starts_at->isToday());

        // Can't activate twice.
        $this->actingAs(User::factory()->create(['role' => StaffRole::Admin]), 'staff')
            ->postJson("/api/staff/hotspot-sessions/{$session->id}/activate")
            ->assertStatus(422);
    }

    public function test_technician_cannot_activate(): void
    {
        $this->purchase();

        $this->actingAs(User::factory()->create(['role' => StaffRole::Technician]), 'staff')
            ->postJson('/api/staff/hotspot-sessions/'.HotspotSession::sole()->id.'/activate')
            ->assertForbidden();
    }
}
