<?php

namespace Database\Seeders;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;
use App\Domain\FieldOps\Models\Technician;
use App\Domain\FieldOps\Models\WorkOrder;
use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use App\Domain\Hotspot\Models\HotspotPlan;
use App\Domain\Hotspot\Models\HotspotSession;
use App\Domain\Network\Models\ConnectedDevice;
use App\Domain\Network\Models\DailyUsage;
use App\Domain\Network\Models\NetworkNode;
use App\Domain\Network\Models\WifiNetwork;
use App\Domain\Plans\Enums\PlanStatus;
use App\Domain\Plans\Models\Plan;
use App\Domain\Staff\Enums\StaffRole;
use App\Domain\Subscribers\Models\Subscriber;
use App\Domain\Support\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // --- Staff ---
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@latticefi.test',
            'password' => Hash::make('password'),
            'role' => StaffRole::Admin,
        ]);
        User::factory(15)->create();

        // --- Plans: fixed tiers mirroring the frontend mocks, not random ---
        $plans = collect([
            ['name' => 'Fiber 100', 'download_mbps' => 100, 'upload_mbps' => 100, 'price' => 34.99],
            ['name' => 'Fiber 300', 'download_mbps' => 300, 'upload_mbps' => 300, 'price' => 54.99],
            ['name' => 'Fiber 500', 'download_mbps' => 500, 'upload_mbps' => 500, 'price' => 79.99],
            ['name' => 'Fiber 1000', 'download_mbps' => 1000, 'upload_mbps' => 1000, 'price' => 129.99],
        ])->map(fn (array $attrs) => Plan::factory()->create([...$attrs, 'status' => PlanStatus::Active]));

        Plan::factory()->archived()->create([
            'name' => 'Legacy DSL 20',
            'download_mbps' => 20,
            'upload_mbps' => 2,
            'price' => 24.99,
        ]);

        // --- Network nodes: topology scale, not customer scale ---
        NetworkNode::factory(15)->create();

        // --- Subscribers: bulk, recycling the plans above ---
        Subscriber::factory(3000)->recycle($plans)->create();

        // --- Invoices: recycling subscribers ---
        Invoice::factory(9000)->recycle(Subscriber::all())->create();

        // --- Payments: one per paid invoice, mirroring that invoice's amount/paid_at ---
        Invoice::where('status', InvoiceStatus::Paid)->chunkById(500, function ($invoices) {
            foreach ($invoices as $invoice) {
                Payment::create([
                    'tenant_id' => $invoice->tenant_id,
                    'invoice_id' => $invoice->id,
                    'amount' => $invoice->amount,
                    'method' => 'manual',
                    'paid_at' => $invoice->paid_at,
                ]);
            }
        });

        // --- Tickets: recycling subscribers and staff ---
        Ticket::factory(400)->recycle(Subscriber::all())->recycle(User::all())->create();

        // --- Field ops: a small dedicated technician team + a matching work-order volume ---
        $technicianUsers = User::factory(10)->create(['role' => StaffRole::Technician]);
        $technicians = $technicianUsers->map(fn (User $user) => Technician::factory()->create(['user_id' => $user->id]));
        WorkOrder::factory(150)->recycle($technicians)->recycle(Subscriber::all())->create();

        // --- Wi-Fi networks: cheap, one per subscriber, bulk-inserted ---
        $now = now();
        Subscriber::query()->select('id', 'tenant_id', 'name')->chunkById(500, function ($subscribers) use ($now) {
            $rows = $subscribers->map(fn (Subscriber $s) => [
                'tenant_id' => $s->tenant_id,
                'subscriber_id' => $s->id,
                'ssid' => "{$s->name}-Home",
                'wifi_password' => Str::password(12),
                'password_updated_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            WifiNetwork::insert($rows);
        });

        // --- Usage + devices: seeded for a sample of subscribers, not all 3000 ---
        $usageSample = Subscriber::inRandomOrder()->limit(300)->get(['id', 'tenant_id']);

        foreach ($usageSample->chunk(20) as $chunk) {
            $rows = [];
            foreach ($chunk as $subscriber) {
                for ($daysAgo = 29; $daysAgo >= 0; $daysAgo--) {
                    $rows[] = [
                        'tenant_id' => $subscriber->tenant_id,
                        'subscriber_id' => $subscriber->id,
                        'usage_date' => now()->subDays($daysAgo)->toDateString(),
                        'download_gb' => fake()->randomFloat(2, 2, 40),
                        'upload_gb' => fake()->randomFloat(2, 1, 15),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
            DailyUsage::insert($rows);
        }

        ConnectedDevice::factory(750)->recycle($usageSample)->create();

        // --- Hotspot: fixed pass tiers, then a sample of sessions across them ---
        $hotspotPlans = collect([
            ['name' => '1 Hour', 'duration_minutes' => 60, 'price' => 0.50],
            ['name' => '3 Hours', 'duration_minutes' => 180, 'price' => 1.50],
            ['name' => '1 Day', 'duration_minutes' => 1440, 'price' => 3.00],
        ])->map(fn (array $attrs) => HotspotPlan::factory()->create([...$attrs, 'status' => HotspotPlanStatus::Active]));

        HotspotSession::factory(180)->recycle($hotspotPlans)->create();
    }
}
