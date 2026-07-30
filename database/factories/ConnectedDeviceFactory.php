<?php

namespace Database\Factories;

use App\Domain\Network\Enums\DeviceType;
use App\Domain\Network\Models\ConnectedDevice;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConnectedDevice>
 */
class ConnectedDeviceFactory extends Factory
{
    protected $model = ConnectedDevice::class;

    public function definition(): array
    {
        $device = fake()->randomElement([
            ['name' => 'Living Room TV', 'type' => DeviceType::Tv],
            ['name' => "iPhone", 'type' => DeviceType::Phone],
            ['name' => 'Samsung Galaxy', 'type' => DeviceType::Phone],
            ['name' => 'MacBook Pro', 'type' => DeviceType::Laptop],
            ['name' => 'Office Laptop', 'type' => DeviceType::Laptop],
            ['name' => 'Home Router', 'type' => DeviceType::Router],
        ]);

        return [
            'tenant_id' => 1,
            'subscriber_id' => Subscriber::factory(),
            'name' => $device['name'],
            'type' => $device['type'],
            'ip_address' => fake()->localIpv4(),
            'connected_since' => fake()->dateTimeBetween('-3 months', '-1 day'),
            'usage_gb_cycle' => fake()->randomFloat(2, 0, 200),
            'is_paused' => fake()->boolean(10),
        ];
    }
}
