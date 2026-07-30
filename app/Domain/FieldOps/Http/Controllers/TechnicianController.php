<?php

namespace App\Domain\FieldOps\Http\Controllers;

use App\Domain\FieldOps\Enums\WorkOrderStatus;
use App\Domain\FieldOps\Http\Requests\StoreTechnicianRequest;
use App\Domain\FieldOps\Http\Requests\UpdateTechnicianRequest;
use App\Domain\FieldOps\Http\Resources\TechnicianResource;
use App\Domain\FieldOps\Models\Technician;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TechnicianController extends Controller
{
    public function index(Request $request)
    {
        $technicians = Technician::query()
            ->with('user')
            ->withCount(['workOrders as jobs_done_today' => fn ($q) => $q
                ->where('status', WorkOrderStatus::Completed)
                ->whereDate('completed_at', today())])
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('zone')->isNotEmpty(), fn ($q) => $q->where('zone', $request->string('zone')))
            ->orderBy('zone')
            ->get();

        return TechnicianResource::collection($technicians);
    }

    public function store(StoreTechnicianRequest $request)
    {
        $technician = Technician::create($request->validated());

        return new TechnicianResource($technician->load('user'));
    }

    public function show(Technician $technician)
    {
        return new TechnicianResource($technician->load('user'));
    }

    public function update(UpdateTechnicianRequest $request, Technician $technician)
    {
        $technician->update($request->validated());

        return new TechnicianResource($technician->load('user'));
    }

    public function destroy(Technician $technician)
    {
        $technician->delete();

        return response()->noContent();
    }
}
