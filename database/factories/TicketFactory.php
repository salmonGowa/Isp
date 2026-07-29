<?php

namespace Database\Factories;

use App\Domain\Support\Enums\TicketPriority;
use App\Domain\Support\Enums\TicketStatus;
use App\Domain\Subscribers\Models\Subscriber;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Domain\Support\Models\Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = \App\Domain\Support\Models\Ticket::class;

    public function definition(): array
    {
        $status = fake()->randomElement(TicketStatus::cases());

        return [
            'tenant_id' => 1,
            'subscriber_id' => Subscriber::factory(),
            'subject' => fake()->randomElement([
                'Intermittent drops in the evening',
                'Static IP request for home office',
                'Router blinking orange after storm',
                'Billed twice this cycle',
                'Slow speeds during peak hours',
                'Wi-Fi password reset request',
                'Router firmware update request',
            ]),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(TicketPriority::cases()),
            'status' => $status,
            'assignee_id' => $status === TicketStatus::Open ? null : User::factory(),
            'sla_due_at' => $status === TicketStatus::Resolved ? null : fake()->dateTimeBetween('now', '+3 days'),
        ];
    }
}
