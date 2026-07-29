<?php

namespace Database\Seeders;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\Payment;
use App\Domain\Network\Models\NetworkNode;
use App\Domain\Plans\Enums\PlanStatus;
use App\Domain\Plans\Models\Plan;
use App\Domain\Staff\Enums\StaffRole;
use App\Domain\Subscribers\Models\Subscriber;
use App\Domain\Support\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
    }
}
