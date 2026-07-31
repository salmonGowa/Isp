<?php

use App\Domain\Analytics\Http\Controllers\DashboardController;
use App\Domain\Analytics\Http\Controllers\ReportsController;
use App\Domain\Auth\Http\Controllers\Staff\StaffAuthController;
use App\Domain\Auth\Http\Controllers\Subscriber\SubscriberAuthController;
use App\Domain\Billing\Http\Controllers\InvoiceController;
use App\Domain\Billing\Http\Controllers\PaymentController;
use App\Domain\Billing\Http\Controllers\Subscriber\PayInvoiceController;
use App\Domain\FieldOps\Http\Controllers\TechnicianController;
use App\Domain\FieldOps\Http\Controllers\WorkOrderController;
use App\Domain\Hotspot\Http\Controllers\HotspotPlanController as StaffHotspotPlanController;
use App\Domain\Hotspot\Http\Controllers\HotspotSessionController;
use App\Domain\Hotspot\Http\Controllers\Public\HotspotPlanController as PublicHotspotPlanController;
use App\Domain\Hotspot\Http\Controllers\Public\PurchaseSessionController;
use App\Domain\Network\Http\Controllers\DeviceController;
use App\Domain\Network\Http\Controllers\NetworkNodeController;
use App\Domain\Network\Http\Controllers\UsageController;
use App\Domain\Network\Http\Controllers\WifiController;
use App\Domain\Plans\Http\Controllers\PlanController;
use App\Domain\Plans\Http\Controllers\Subscriber\PlanController as PortalPlanController;
use App\Domain\Staff\Http\Controllers\StaffController;
use App\Domain\Subscribers\Http\Controllers\Subscriber\CancelServiceController;
use App\Domain\Subscribers\Http\Controllers\Subscriber\ChangePlanController;
use App\Domain\Subscribers\Http\Controllers\Subscriber\DeleteAccountController;
use App\Domain\Subscribers\Http\Controllers\Subscriber\UpdatePasswordController;
use App\Domain\Subscribers\Http\Controllers\Subscriber\UpdateProfileController;
use App\Domain\Subscribers\Http\Controllers\SubscriberController;
use App\Domain\Support\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — ISP Platform
|--------------------------------------------------------------------------
|
| Two Sanctum SPA session guards, both first-party/same-origin so this is
| pure session-cookie auth (no bearer tokens issued):
|   - `staff`      powers the admin/NOC console at /admin
|   - `subscriber` powers the customer portal at /portal
|
| See README.md "API" section for the full route table and required env
| vars (Redis, Reverb, tenancy, billing).
|
*/

Route::post('/staff/login', [StaffAuthController::class, 'login']);
Route::post('/portal/login', [SubscriberAuthController::class, 'login']);

// Public, unauthenticated — no subscriber/staff account involved. A hotspot
// device is identified only by MAC address; anyone reaching this endpoint
// can buy themselves a pass.
Route::get('/hotspot/plans', [PublicHotspotPlanController::class, 'index']);
Route::post('/hotspot/purchase', [PurchaseSessionController::class, 'store'])->middleware('throttle:20,1');

Route::middleware('auth:staff')->prefix('staff')->group(function () {
    Route::post('/logout', [StaffAuthController::class, 'logout']);
    Route::get('/me', [StaffAuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports', [ReportsController::class, 'index']);

    Route::apiResource('subscribers', SubscriberController::class);
    Route::apiResource('plans', PlanController::class);
    Route::apiResource('invoices', InvoiceController::class)->except(['update']);
    Route::post('invoices/{invoice}/payments', [PaymentController::class, 'store']);
    Route::apiResource('network-nodes', NetworkNodeController::class);
    Route::apiResource('tickets', TicketController::class);
    Route::apiResource('technicians', TechnicianController::class);
    Route::apiResource('work-orders', WorkOrderController::class);
    Route::post('work-orders/{workOrder}/dispatch', [WorkOrderController::class, 'dispatch']);

    Route::apiResource('hotspot-plans', StaffHotspotPlanController::class);
    Route::get('/hotspot-sessions', [HotspotSessionController::class, 'index']);
    Route::post('/hotspot-sessions', [HotspotSessionController::class, 'store']);
    Route::post('/hotspot-sessions/{hotspotSession}/revoke', [HotspotSessionController::class, 'revoke']);

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('staff', StaffController::class);
    });
});

Route::middleware('auth:subscriber')->prefix('portal')->group(function () {
    Route::post('/logout', [SubscriberAuthController::class, 'logout']);
    Route::get('/me', [SubscriberAuthController::class, 'me']);

    Route::get('/invoices', [InvoiceController::class, 'myInvoices']);
    Route::post('/invoices/{invoice}/pay', [PayInvoiceController::class, 'store']);
    Route::apiResource('tickets', TicketController::class)->only(['index', 'store', 'show']);

    Route::get('/usage', [UsageController::class, 'myUsage']);

    Route::get('/wifi', [WifiController::class, 'show']);
    Route::post('/wifi/regenerate-password', [WifiController::class, 'regeneratePassword']);
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::patch('/devices/{device}', [DeviceController::class, 'update']);

    Route::patch('/profile', [UpdateProfileController::class, 'store']);
    Route::put('/profile/password', [UpdatePasswordController::class, 'store']);
    Route::get('/plans', [PortalPlanController::class, 'index']);
    Route::post('/plan', [ChangePlanController::class, 'store']);
    Route::post('/service/cancel', [CancelServiceController::class, 'store']);
    Route::delete('/account', [DeleteAccountController::class, 'destroy']);
});
