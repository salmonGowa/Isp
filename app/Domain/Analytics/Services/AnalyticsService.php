<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\FieldOps\Enums\WorkOrderStatus;
use App\Domain\FieldOps\Enums\WorkOrderType;
use App\Domain\FieldOps\Models\WorkOrder;
use App\Domain\Network\Models\NetworkNode;
use App\Domain\Plans\Models\Plan;
use App\Domain\Subscribers\Enums\SubscriberStatus;
use App\Domain\Subscribers\Models\Subscriber;
use App\Domain\Support\Enums\TicketStatus;
use App\Domain\Support\Models\Ticket;
use Illuminate\Support\Collection;

/**
 * Every method here reads only from tables the app actually has — no
 * historical snapshots exist, so month-bucketed trends are built from
 * `issued_at`/`joined_at` on the live rows, bucketed in PHP (not SQL
 * DATE_FORMAT/strftime — tests run on sqlite, prod on MySQL, and this
 * keeps the query portable across both).
 */
class AnalyticsService
{
    public function activeSubscriberCount(): int
    {
        return Subscriber::where('status', SubscriberStatus::Active)->count();
    }

    public function mrr(): float
    {
        return (float) Subscriber::where('status', SubscriberStatus::Active)->sum('monthly_bill');
    }

    public function arpu(): float
    {
        $count = $this->activeSubscriberCount();

        return $count > 0 ? round($this->mrr() / $count, 2) : 0.0;
    }

    public function networkUptimePct(): float
    {
        return round((float) NetworkNode::avg('uptime_pct'), 2);
    }

    public function openTicketCount(): int
    {
        return Ticket::whereIn('status', [TicketStatus::Open, TicketStatus::InProgress])->count();
    }

    public function overdueAccountCount(): int
    {
        return Subscriber::where('status', SubscriberStatus::Overdue)->count();
    }

    public function planMix(): array
    {
        return Plan::withCount('subscribers')
            ->get()
            ->map(fn ($plan) => [
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'subscriber_count' => $plan->subscribers_count,
            ])
            ->all();
    }

    public function subscriberGrowthByZone(): array
    {
        return Subscriber::query()
            ->selectRaw('zone, count(*) as subscriber_count')
            ->groupBy('zone')
            ->orderByDesc('subscriber_count')
            ->get()
            ->map(fn ($row) => ['zone' => $row->zone, 'subscriber_count' => (int) $row->subscriber_count])
            ->all();
    }

    public function revenueTrend(int $months = 6): array
    {
        $rows = Invoice::where('status', InvoiceStatus::Paid)
            ->where('issued_at', '>=', now()->startOfMonth()->subMonths($months - 1))
            ->get(['amount', 'issued_at']);

        return $this->bucketByMonth($rows, $months, 'issued_at', 'revenue', fn ($group) => (float) $group->sum('amount'));
    }

    public function subscriberGrowthTrend(int $months = 6): array
    {
        $subscribers = Subscriber::where('joined_at', '<=', now())->get(['joined_at']);

        $result = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $monthEnd = now()->startOfMonth()->subMonths($i)->endOfMonth();
            $result[] = [
                'month' => $monthEnd->format('Y-m'),
                'total_subscribers' => $subscribers->filter(fn ($s) => $s->joined_at <= $monthEnd)->count(),
            ];
        }

        return $result;
    }

    public function averageInstallTimeHours(): ?float
    {
        $orders = WorkOrder::where('type', WorkOrderType::Install)
            ->where('status', WorkOrderStatus::Completed)
            ->whereNotNull('completed_at')
            ->get(['scheduled_at', 'completed_at']);

        if ($orders->isEmpty()) {
            return null;
        }

        $totalHours = $orders->sum(fn ($order) => $order->scheduled_at->diffInHours($order->completed_at));

        return round($totalHours / $orders->count(), 1);
    }

    private function bucketByMonth(Collection $rows, int $months, string $dateField, string $valueKey, callable $aggregator): array
    {
        $result = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = now()->startOfMonth()->subMonths($i);
            $monthEnd = (clone $monthStart)->endOfMonth();

            $group = $rows->filter(fn ($row) => $row->{$dateField} >= $monthStart && $row->{$dateField} <= $monthEnd);

            $result[] = ['month' => $monthStart->format('Y-m'), $valueKey => $aggregator($group)];
        }

        return $result;
    }
}
