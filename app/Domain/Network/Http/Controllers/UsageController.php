<?php

namespace App\Domain\Network\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UsageController extends Controller
{
    /**
     * Treated pragmatically as a rolling 30-day window ending today — the
     * system doesn't track a precise per-subscriber billing-cycle start date,
     * so this isn't tied to actual invoice issued_at/due_at boundaries.
     */
    public function myUsage(Request $request): array
    {
        $subscriber = $request->user('subscriber');

        $daily = $subscriber->dailyUsages()
            ->where('usage_date', '>=', now()->subDays(29)->toDateString())
            ->orderBy('usage_date')
            ->get(['usage_date', 'download_gb', 'upload_gb'])
            ->map(fn ($row) => [
                'date' => $row->usage_date->toDateString(),
                'download_gb' => (float) $row->download_gb,
                'upload_gb' => (float) $row->upload_gb,
            ]);

        $totals = $daily->map(fn ($row) => $row['download_gb'] + $row['upload_gb']);
        $averageDaily = $totals->isNotEmpty() ? round($totals->avg(), 1) : 0.0;

        return [
            'daily' => $daily->values()->all(),
            'stats' => [
                'average_daily_gb' => $averageDaily,
                'peak_daily_gb' => $totals->isNotEmpty() ? round($totals->max(), 1) : 0.0,
                'projected_total_gb' => round($averageDaily * 30, 1),
            ],
        ];
    }
}
