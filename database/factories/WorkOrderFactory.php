<?php

namespace Database\Factories;

use App\Domain\FieldOps\Enums\WorkOrderStatus;
use App\Domain\FieldOps\Enums\WorkOrderType;
use App\Domain\FieldOps\Models\Technician;
use App\Domain\FieldOps\Models\WorkOrder;
use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    protected $model = WorkOrder::class;

    public function definition(): array
    {
        $scheduledAt = fake()->dateTimeBetween('-2 weeks', '+1 week');
        $isPast = $scheduledAt <= new \DateTime;

        $status = $isPast
            ? fake()->randomElement([WorkOrderStatus::InProgress, WorkOrderStatus::Completed, WorkOrderStatus::Completed])
            : WorkOrderStatus::Scheduled;

        $isNewInstallLead = fake()->boolean(30);

        return [
            'tenant_id' => 1,
            'type' => fake()->randomElement(WorkOrderType::cases()),
            'subscriber_id' => $isNewInstallLead ? null : Subscriber::factory(),
            'lead_name' => $isNewInstallLead ? fake()->name() : null,
            'address' => fake()->streetAddress(),
            'technician_id' => $status === WorkOrderStatus::Scheduled && fake()->boolean(40)
                ? null
                : Technician::factory(),
            'scheduled_at' => $scheduledAt,
            'status' => $status,
            'completed_at' => $status === WorkOrderStatus::Completed
                ? fake()->dateTimeBetween($scheduledAt, 'now')
                : null,
        ];
    }
}
