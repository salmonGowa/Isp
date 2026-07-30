<?php

namespace Database\Factories;

use App\Domain\FieldOps\Enums\TechnicianStatus;
use App\Domain\FieldOps\Models\Technician;
use App\Domain\Staff\Enums\StaffRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Technician>
 */
class TechnicianFactory extends Factory
{
    protected $model = Technician::class;

    public function definition(): array
    {
        return [
            'tenant_id' => 1,
            'user_id' => User::factory()->state(['role' => StaffRole::Technician]),
            'status' => fake()->randomElement([
                TechnicianStatus::Available,
                TechnicianStatus::Available,
                TechnicianStatus::OnJob,
                TechnicianStatus::OffDuty,
            ]),
            'zone' => fake()->randomElement(SubscriberFactory::ZONES),
            'current_job_description' => null,
        ];
    }
}
