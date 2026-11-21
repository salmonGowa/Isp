<?php

use App\Domain\Analytics\Http\Controllers\DashboardController;
use App\Domain\Analytics\Http\Controllers\ReportsController;
use App\Domain\Auth\Http\Controllers\Staff\StaffAuthController;
use App\Domain\Auth\Http\Controllers\Subscriber\SubscriberAuthController;
use App\Domain\Billing\Http\Controllers\InvoiceController;
use App\Domain\Billing\Http\Controllers\PaymentController;
use App\Domain\Billing\Http\Controllers\PaymentReviewController;
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

Route::post('/staff/login', [StaffAuthController::class, 'login'])->middleware('throttle:login');
Route::post('/portal/login', [SubscriberAuthController::class, 'login'])->middleware('throttle:login');

// Public, unauthenticated — no subscriber/staff account involved. A hotspot
// device is identified by MAC address (HMAC-signed by the router when
// HOTSPOT_MAC_SIGNING_SECRET is set). A purchase is only *recorded* here as
// pending; the device is authorized once payment is verified.
Route::get('/hotspot/plans', [PublicHotspotPlanController::class, 'index']);
Route::post('/hotspot/purchase', [PurchaseSessionController::class, 'store'])->middleware('throttle:20,1');

// Staff console. Every staff role can READ everything (the console renders all
// tabs); WRITES are restricted per role. `admin` is allowed everywhere.
Route::middleware('auth:staff')->prefix('staff')->group(function () {
    Route::post('/logout', [StaffAuthController::class, 'logout']);
    Route::get('/me', [StaffAuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // --- Read-only, any staff role ---
    Route::apiResource('subscribers', SubscriberController::class)->only(['index', 'show']);
    Route::apiResource('plans', PlanController::class)->only(['index', 'show']);
    Route::apiResource('invoices', InvoiceController::class)->only(['index', 'show']);
    Route::apiResource('network-nodes', NetworkNodeController::class)->only(['index', 'show']);
    Route::apiResource('tickets', TicketController::class)->only(['index', 'show']);
    Route::apiResource('technicians', TechnicianController::class)->only(['index', 'show']);
    Route::apiResource('work-orders', WorkOrderController::class)->only(['index', 'show']);
    Route::apiResource('hotspot-plans', StaffHotspotPlanController::class)->only(['index', 'show']);
    Route::get('/hotspot-sessions', [HotspotSessionController::class, 'index']);

    // --- Billing: money and pricing ---
    Route::middleware('role:admin,billing')->group(function () {
        Route::get('/reports', [ReportsController::class, 'index']);
        Route::apiResource('plans', PlanController::class)->only(['store', 'update', 'destroy']);
        Route::post('invoices', [InvoiceController::class, 'store']);
        Route::post('invoices/{invoice}/payments', [PaymentController::class, 'store']);
        Route::get('/payments', [PaymentReviewController::class, 'index']);
        Route::post('/payments/{payment}/confirm', [PaymentReviewController::class, 'confirm']);
        Route::post('/payments/{payment}/reject', [PaymentReviewController::class, 'reject']);
        Route::apiResource('hotspot-plans', StaffHotspotPlanController::class)->only(['store', 'update', 'destroy']);
    });

    // --- Subscriber records: billing + support maintain them ---
    Route::middleware('role:admin,billing,support')->group(function () {
        Route::apiResource('subscribers', SubscriberController::class)->only(['store', 'update']);
    });

    // --- Support desk ---
    Route::middleware('role:admin,support,noc')->group(function () {
        Route::apiResource('tickets', TicketController::class)->only(['store', 'update']);
    });

    // --- Network operations ---
    Route::middleware('role:admin,noc')->group(function () {
        Route::apiResource('network-nodes', NetworkNodeController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('technicians', TechnicianController::class)->only(['store', 'update', 'destroy']);
        Route::post('work-orders', [WorkOrderController::class, 'store']);
        Route::post('work-orders/{workOrder}/dispatch', [WorkOrderController::class, 'dispatch']);
        Route::delete('work-orders/{workOrder}', [WorkOrderController::class, 'destroy']);
    });

    // Technicians update the jobs they're working (status, notes).
    Route::middleware('role:admin,noc,technician')->group(function () {
        Route::match(['put', 'patch'], 'work-orders/{workOrder}', [WorkOrderController::class, 'update']);
    });

    // --- Hotspot desk: verifying payments and granting/revoking access ---
    Route::middleware('role:admin,billing,noc,support')->group(function () {
        Route::post('/hotspot-sessions', [HotspotSessionController::class, 'store']);
        Route::post('/hotspot-sessions/{hotspotSession}/activate', [HotspotSessionController::class, 'activate']);
        Route::post('/hotspot-sessions/{hotspotSession}/revoke', [HotspotSessionController::class, 'revoke']);
    });

    // --- Admin only: destructive and account management ---
    Route::middleware('role:admin')->group(function () {
        Route::delete('subscribers/{subscriber}', [SubscriberController::class, 'destroy']);
        Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy']);
        Route::delete('tickets/{ticket}', [TicketController::class, 'destroy']);
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
