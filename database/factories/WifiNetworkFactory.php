<?php

namespace Database\Factories;

use App\Domain\Network\Models\WifiNetwork;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WifiNetwork>
 */
class WifiNetworkFactory extends Factory
{
    protected $model = WifiNetwork::class;

    public function definition(): array
    {
        return [
            'tenant_id' => 1,
            'subscriber_id' => Subscriber::factory(),
            'ssid' => fake()->firstName().'-Home',
            'wifi_password' => Str::password(12),
            'password_updated_at' => null,
        ];
    }
}
