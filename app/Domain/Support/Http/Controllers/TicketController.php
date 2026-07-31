<?php

namespace App\Domain\Support\Http\Controllers;

use App\Domain\Support\Enums\TicketPriority;
use App\Domain\Support\Enums\TicketStatus;
use App\Domain\Support\Http\Requests\StoreTicketRequest;
use App\Domain\Support\Http\Requests\UpdateTicketRequest;
use App\Domain\Support\Http\Resources\TicketResource;
use App\Domain\Support\Models\Ticket;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = Ticket::query()
            ->with(['subscriber', 'assignee'])
            ->when($request->user('subscriber'), fn ($q, $subscriber) => $q->where('subscriber_id', $subscriber->id))
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('priority')->isNotEmpty(), fn ($q) => $q->where('priority', $request->string('priority')))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request)
    {
        $ticket = Ticket::create([
            ...$request->validated(),
            'subscriber_id' => $request->user('subscriber')?->id ?? $request->validated('subscriber_id'),
            'priority' => $request->validated('priority') ?? TicketPriority::Medium,
            'status' => TicketStatus::Open,
        ]);

        return new TicketResource($ticket->load(['subscriber', 'assignee']));
    }

    public function show(Request $request, Ticket $ticket)
    {
        if ($subscriber = $request->user('subscriber')) {
            abort_unless($ticket->subscriber_id === $subscriber->id, 403);
        }

        return new TicketResource($ticket->load(['subscriber', 'assignee']));
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $ticket->update($request->validated());

        return new TicketResource($ticket->load(['subscriber', 'assignee']));
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return response()->noContent();
    }
}
