<?php

namespace App\Domain\Network\Http\Requests;

use App\Domain\Network\Enums\NetworkNodeStatus;
use App\Domain\Network\Enums\NetworkNodeType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateNetworkNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('network_nodes', 'identifier')->ignore($this->route('network_node'))],
            'type' => ['sometimes', 'required', new Enum(NetworkNodeType::class)],
            'zone' => ['sometimes', 'required', 'string', 'max:100'],
            'status' => ['sometimes', 'required', new Enum(NetworkNodeStatus::class)],
            'uptime_pct' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'load_pct' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'subscriber_count' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
