<?php

namespace Database\Factories;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $status = fake()->randomElement([
            InvoiceStatus::Paid,
            InvoiceStatus::Paid,
            InvoiceStatus::Paid,
            InvoiceStatus::Due,
            InvoiceStatus::Overdue,
        ]);

        $issuedAt = fake()->dateTimeBetween('-6 months', '-1 day');
        $dueAt = (clone $issuedAt)->modify('+14 days');

        return [
            'tenant_id' => 1,
            'subscriber_id' => Subscriber::factory(),
            'amount' => fake()->randomFloat(2, 20, 150),
            'status' => $status,
            'issued_at' => $issuedAt,
            'due_at' => $dueAt,
            'paid_at' => $status === InvoiceStatus::Paid
                ? fake()->dateTimeBetween($issuedAt, min($dueAt, new \DateTime))
                : null,
        ];
    }
}
