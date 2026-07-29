<?php

namespace App\Domain\Network\Http\Controllers;

use App\Domain\Network\Http\Requests\StoreNetworkNodeRequest;
use App\Domain\Network\Http\Requests\UpdateNetworkNodeRequest;
use App\Domain\Network\Http\Resources\NetworkNodeResource;
use App\Domain\Network\Models\NetworkNode;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NetworkNodeController extends Controller
{
    public function index(Request $request)
    {
        $nodes = NetworkNode::query()
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('zone')->isNotEmpty(), fn ($q) => $q->where('zone', $request->string('zone')))
            ->orderBy('identifier')
            ->get();

        return NetworkNodeResource::collection($nodes);
    }

    public function store(StoreNetworkNodeRequest $request)
    {
        $node = NetworkNode::create($request->validated());

        return new NetworkNodeResource($node);
    }

    public function show(NetworkNode $networkNode)
    {
        return new NetworkNodeResource($networkNode);
    }

    public function update(UpdateNetworkNodeRequest $request, NetworkNode $networkNode)
    {
        $networkNode->update($request->validated());

        return new NetworkNodeResource($networkNode);
    }

    public function destroy(NetworkNode $networkNode)
    {
        $networkNode->delete();

        return response()->noContent();
    }
}
