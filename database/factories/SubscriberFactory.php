<?php

namespace Database\Factories;

use App\Domain\Plans\Models\Plan;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Subscriber>
 */
class SubscriberFactory extends Factory
{
    protected $model = Subscriber::class;

    protected static ?string $password;

    /** @var array<int, Plan> */
    protected static array $planCache = [];

    public const ZONES = ['Kilimani', 'Karen', 'Ngong', 'Westlands', 'Muthaiga'];

    public function definition(): array
    {
        return [
            'tenant_id' => 1,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('+2547########'),
            'password' => static::$password ??= Hash::make('password'),
            'plan_id' => Plan::factory(),
            'status' => fake()->randomElement([
                SubscriberStatus::Active,
                SubscriberStatus::Active,
                SubscriberStatus::Active,
                SubscriberStatus::Active,
                SubscriberStatus::Suspended,
                SubscriberStatus::Overdue,
            ]),
            'service_address' => fake()->streetAddress(),
            'zone' => fake()->randomElement(self::ZONES),
            'monthly_bill' => fake()->randomFloat(2, 20, 150),
            'joined_at' => fake()->dateTimeBetween('-2 years', '-1 week'),
            'last_payment_at' => fake()->optional(0.85)->dateTimeBetween('-2 months', 'now'),
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (Subscriber $subscriber) {
            if (! $subscriber->plan_id) {
                return;
            }

            $plan = static::$planCache[$subscriber->plan_id] ??= Plan::find($subscriber->plan_id);

            if ($plan) {
                $subscriber->monthly_bill = $plan->price;
            }
        });
    }
}
