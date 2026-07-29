<?php

namespace Database\Factories;

use App\Domain\Plans\Enums\PlanStatus;
use App\Domain\Plans\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        $down = fake()->randomElement([50, 100, 200, 300, 500, 1000]);

        return [
            'tenant_id' => 1,
            'name' => "Fiber {$down}",
            'download_mbps' => $down,
            'upload_mbps' => $down,
            'price' => round($down * 0.13, 2),
            'status' => PlanStatus::Active,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn () => ['status' => PlanStatus::Archived]);
    }
}
