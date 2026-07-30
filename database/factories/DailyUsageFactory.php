<?php

namespace Database\Factories;

use App\Domain\Network\Models\DailyUsage;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DailyUsage>
 */
class DailyUsageFactory extends Factory
{
    protected $model = DailyUsage::class;

    public function definition(): array
    {
        return [
            'tenant_id' => 1,
            'subscriber_id' => Subscriber::factory(),
            'usage_date' => fake()->dateTimeBetween('-29 days', 'now')->format('Y-m-d'),
            'download_gb' => fake()->randomFloat(2, 2, 40),
            'upload_gb' => fake()->randomFloat(2, 1, 15),
        ];
    }
}
