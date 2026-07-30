<?php

namespace App\Domain\FieldOps\Http\Controllers;

use App\Domain\FieldOps\Enums\TechnicianStatus;
use App\Domain\FieldOps\Enums\WorkOrderStatus;
use App\Domain\FieldOps\Http\Requests\DispatchWorkOrderRequest;
use App\Domain\FieldOps\Http\Requests\StoreWorkOrderRequest;
use App\Domain\FieldOps\Http\Requests\UpdateWorkOrderRequest;
use App\Domain\FieldOps\Http\Resources\WorkOrderResource;
use App\Domain\FieldOps\Models\Technician;
use App\Domain\FieldOps\Models\WorkOrder;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        $workOrders = WorkOrder::query()
            ->with(['subscriber', 'technician.user'])
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('type')->isNotEmpty(), fn ($q) => $q->where('type', $request->string('type')))
            ->latest('scheduled_at')
            ->paginate($request->integer('per_page', 20));

        return WorkOrderResource::collection($workOrders);
    }

    public function store(StoreWorkOrderRequest $request)
    {
        $workOrder = WorkOrder::create([
            ...$request->validated(),
            'status' => WorkOrderStatus::Scheduled,
        ]);

        return new WorkOrderResource($workOrder->load(['subscriber', 'technician.user']));
    }

    public function show(WorkOrder $workOrder)
    {
        return new WorkOrderResource($workOrder->load(['subscriber', 'technician.user']));
    }

    public function update(UpdateWorkOrderRequest $request, WorkOrder $workOrder)
    {
        $data = $request->validated();

        DB::transaction(function () use ($workOrder, $data) {
            $completingNow = isset($data['status'])
                && $data['status'] === WorkOrderStatus::Completed->value
                && $workOrder->status !== WorkOrderStatus::Completed;

            if ($completingNow) {
                $data['completed_at'] = now();
            }

            $workOrder->update($data);

            if ($completingNow && $workOrder->technician_id) {
                $workOrder->technician->update([
                    'status' => TechnicianStatus::Available,
                    'current_job_description' => null,
                ]);
            }
        });

        return new WorkOrderResource($workOrder->fresh(['subscriber', 'technician.user']));
    }

    public function destroy(WorkOrder $workOrder)
    {
        $workOrder->delete();

        return response()->noContent();
    }

    public function dispatch(DispatchWorkOrderRequest $request, WorkOrder $workOrder)
    {
        $technician = Technician::findOrFail($request->validated('technician_id'));

        DB::transaction(function () use ($workOrder, $technician, $request) {
            $workOrder->update([
                'technician_id' => $technician->id,
                'status' => WorkOrderStatus::InProgress,
                'scheduled_at' => $request->validated('scheduled_at', $workOrder->scheduled_at),
            ]);

            $technician->update([
                'status' => TechnicianStatus::OnJob,
                'current_job_description' => "{$workOrder->type->value} at {$workOrder->address}",
            ]);
        });

        return new WorkOrderResource($workOrder->fresh(['subscriber', 'technician.user']));
    }
}
