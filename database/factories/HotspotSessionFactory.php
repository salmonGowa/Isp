<?php

namespace Database\Factories;

use App\Domain\Hotspot\Enums\HotspotSessionStatus;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Domain\Hotspot\Models\HotspotSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HotspotSession>
 */
class HotspotSessionFactory extends Factory
{
    protected $model = HotspotSession::class;

    public function definition(): array
    {
        $status = fake()->randomElement([
            HotspotSessionStatus::Active,
            HotspotSessionStatus::Active,
            HotspotSessionStatus::Expired,
            HotspotSessionStatus::Expired,
            HotspotSessionStatus::Expired,
            HotspotSessionStatus::Revoked,
        ]);

        if ($status === HotspotSessionStatus::Active) {
            $startsAt = fake()->dateTimeBetween('-2 hours', 'now');
            $expiresAt = (new \DateTime)->modify('+'.fake()->numberBetween(10, 1440).' minutes');
            $revokedAt = null;
        } else {
            $startsAt = fake()->dateTimeBetween('-30 days', '-1 day');
            $expiresAt = (clone $startsAt)->modify('+'.fake()->numberBetween(60, 1440).' minutes');
            $revokedAt = $status === HotspotSessionStatus::Revoked
                ? fake()->dateTimeBetween($startsAt, $expiresAt)
                : null;
        }

        return [
            'tenant_id' => 1,
            'mac_address' => strtoupper(fake()->macAddress()),
            'hotspot_plan_id' => HotspotPlan::factory(),
            'amount_paid' => fake()->randomFloat(2, 0.5, 5),
            'payment_reference' => fake()->boolean(70) ? strtoupper(fake()->bothify('??########')) : null,
            'status' => $status,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'revoked_at' => $revokedAt,
        ];
    }
}
