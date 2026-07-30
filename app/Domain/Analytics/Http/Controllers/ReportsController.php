<?php

namespace App\Domain\Analytics\Http\Controllers;

use App\Domain\Analytics\Services\AnalyticsService;
use App\Http\Controllers\Controller;

class ReportsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    public function index(): array
    {
        $installTime = $this->analytics->averageInstallTimeHours();

        return [
            'revenue_vs_churn' => collect($this->analytics->revenueTrend())
                ->map(fn ($row) => [...$row, 'churned_subscribers' => null])
                ->all(),
            'subscriber_growth_by_zone' => $this->analytics->subscriberGrowthByZone(),
            'key_ratios' => [
                'arpu' => ['value' => $this->analytics->arpu(), 'source' => 'computed'],
                'monthly_churn_pct' => [
                    'value' => null,
                    'source' => 'illustrative',
                    'note' => 'Subscribers only store current status, not a status-transition history, so a historical churn rate cannot be honestly derived yet.',
                ],
                'cac' => [
                    'value' => config('analytics.illustrative.cac'),
                    'source' => 'illustrative',
                    'note' => 'No marketing-spend or acquisition-cost data is captured anywhere in this system.',
                ],
                'avg_install_time_hours' => [
                    'value' => $installTime,
                    'source' => $installTime !== null ? 'computed' : 'illustrative',
                    'note' => $installTime !== null ? null : 'No completed install work orders yet.',
                ],
                'nps' => [
                    'value' => config('analytics.illustrative.nps'),
                    'source' => 'illustrative',
                    'note' => 'No customer-survey data is captured anywhere in this system.',
                ],
            ],
        ];
    }
}
