<?php

use App\Domain\Billing\Jobs\GenerateInvoicesJob;
use App\Domain\Billing\Jobs\SuspendOverdueSubscribersJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new GenerateInvoicesJob)->dailyAt('01:00');
Schedule::job(new SuspendOverdueSubscribersJob)->dailyAt('02:00');
