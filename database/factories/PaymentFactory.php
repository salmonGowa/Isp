<?php

namespace Database\Factories;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'tenant_id' => 1,
            'invoice_id' => Invoice::factory(),
            'amount' => fake()->randomFloat(2, 20, 150),
            'method' => 'manual',
            'reference' => null,
            'paid_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
