<?php

namespace App\Domain\Network\Http\Requests;

use App\Domain\Network\Enums\NetworkNodeStatus;
use App\Domain\Network\Enums\NetworkNodeType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreNetworkNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string', 'max:255', 'unique:network_nodes,identifier'],
            'type' => ['required', new Enum(NetworkNodeType::class)],
            'zone' => ['required', 'string', 'max:100'],
            'status' => ['sometimes', 'required', new Enum(NetworkNodeStatus::class)],
            'uptime_pct' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'load_pct' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'subscriber_count' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
