<?php

namespace App\Domain\Analytics\Http\Controllers;

use App\Domain\Analytics\Services\AnalyticsService;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    public function index(): array
    {
        return [
            'kpis' => [
                'active_subscribers' => ['value' => $this->analytics->activeSubscriberCount(), 'source' => 'computed'],
                'mrr' => ['value' => $this->analytics->mrr(), 'source' => 'computed'],
                'active_sessions' => [
                    'value' => config('analytics.illustrative.active_sessions'),
                    'source' => 'illustrative',
                    'note' => 'No RADIUS/session-accounting integration exists yet (see LogRadiusProvisioner); static placeholder, not measured.',
                ],
                'network_uptime_pct' => ['value' => $this->analytics->networkUptimePct(), 'source' => 'computed'],
                'open_tickets' => ['value' => $this->analytics->openTicketCount(), 'source' => 'computed'],
                'overdue_accounts' => ['value' => $this->analytics->overdueAccountCount(), 'source' => 'computed'],
            ],
            'revenue_trend' => $this->analytics->revenueTrend(),
            'plan_mix' => $this->analytics->planMix(),
            'subscriber_growth' => $this->analytics->subscriberGrowthTrend(),
        ];
    }
}
