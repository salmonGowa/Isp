<?php

namespace App\Domain\Staff\Http\Controllers;

use App\Domain\Staff\Http\Requests\StoreStaffRequest;
use App\Domain\Staff\Http\Requests\UpdateStaffRequest;
use App\Domain\Staff\Http\Resources\StaffResource;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $staff = User::query()
            ->when($request->string('role')->isNotEmpty(), fn ($q) => $q->where('role', $request->string('role')))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return StaffResource::collection($staff);
    }

    public function store(StoreStaffRequest $request)
    {
        $staff = User::create($request->validated());

        return new StaffResource($staff);
    }

    public function show(User $staff)
    {
        return new StaffResource($staff);
    }

    public function update(UpdateStaffRequest $request, User $staff)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $staff->update($data);

        return new StaffResource($staff);
    }

    public function destroy(User $staff)
    {
        $staff->delete();

        return response()->noContent();
    }
}
