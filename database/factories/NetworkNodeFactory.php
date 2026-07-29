<?php

namespace Database\Factories;

use App\Domain\Network\Enums\NetworkNodeStatus;
use App\Domain\Network\Enums\NetworkNodeType;
use App\Domain\Network\Models\NetworkNode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NetworkNode>
 */
class NetworkNodeFactory extends Factory
{
    protected $model = NetworkNode::class;

    protected static int $sequenceNumber = 1;

    public function definition(): array
    {
        $type = fake()->randomElement(NetworkNodeType::cases());
        $zone = fake()->randomElement(\Database\Factories\SubscriberFactory::ZONES);
        $n = static::$sequenceNumber++;

        $status = fake()->randomElement([
            NetworkNodeStatus::Online,
            NetworkNodeStatus::Online,
            NetworkNodeStatus::Online,
            NetworkNodeStatus::Online,
            NetworkNodeStatus::Degraded,
            NetworkNodeStatus::Offline,
        ]);

        return [
            'tenant_id' => 1,
            'identifier' => "{$type->value}-{$zone}-{$n}",
            'type' => $type,
            'zone' => $zone,
            'status' => $status,
            'uptime_pct' => $status === NetworkNodeStatus::Offline ? 0 : fake()->randomFloat(2, 95, 100),
            'load_pct' => $status === NetworkNodeStatus::Offline ? 0 : fake()->randomFloat(2, 10, 95),
            'subscriber_count' => fake()->numberBetween(50, 2000),
        ];
    }
}
