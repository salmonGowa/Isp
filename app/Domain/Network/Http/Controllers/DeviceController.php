<?php

namespace App\Domain\Network\Http\Controllers;

use App\Domain\Network\Http\Requests\UpdateConnectedDeviceRequest;
use App\Domain\Network\Http\Resources\ConnectedDeviceResource;
use App\Domain\Network\Models\ConnectedDevice;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $devices = $request->user('subscriber')->connectedDevices()->orderBy('name')->get();

        return ConnectedDeviceResource::collection($devices);
    }

    public function update(UpdateConnectedDeviceRequest $request, ConnectedDevice $device)
    {
        abort_unless($device->subscriber_id === $request->user('subscriber')->id, 403);

        $device->update($request->validated());

        return new ConnectedDeviceResource($device);
    }
}
