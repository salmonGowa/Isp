<?php

namespace App\Domain\Billing\Http\Controllers;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\Http\Requests\StoreInvoiceRequest;
use App\Domain\Billing\Http\Resources\InvoiceResource;
use App\Domain\Billing\Models\Invoice;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = Invoice::query()
            ->with('subscriber')
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->integer('subscriber_id'), fn ($q, $id) => $q->where('subscriber_id', $id))
            ->latest('issued_at')
            ->paginate($request->integer('per_page', 20));

        return InvoiceResource::collection($invoices);
    }

    public function store(StoreInvoiceRequest $request)
    {
        $invoice = Invoice::create([
            ...$request->validated(),
            'status' => InvoiceStatus::Due,
            'issued_at' => now(),
        ]);

        return new InvoiceResource($invoice->load('subscriber'));
    }

    public function show(Invoice $invoice)
    {
        return new InvoiceResource($invoice->load('subscriber', 'payments'));
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return response()->noContent();
    }

    /**
     * Invoices for the currently authenticated subscriber (customer portal).
     */
    public function myInvoices(Request $request)
    {
        $invoices = Invoice::query()
            ->where('subscriber_id', $request->user('subscriber')->id)
            ->latest('issued_at')
            ->paginate($request->integer('per_page', 20));

        return InvoiceResource::collection($invoices);
    }
}
