<?php

namespace Database\Factories;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use App\Domain\Hotspot\Models\HotspotPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HotspotPlan>
 */
class HotspotPlanFactory extends Factory
{
    protected $model = HotspotPlan::class;

    public function definition(): array
    {
        return [
            'tenant_id' => 1,
            'name' => '1 Hour',
            'duration_minutes' => 60,
            'price' => 0.50,
            'status' => HotspotPlanStatus::Active,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn () => ['status' => HotspotPlanStatus::Archived]);
    }
}
