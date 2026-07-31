<?php

namespace App\Domain\Subscribers\Http\Controllers\Subscriber;

use App\Domain\Subscribers\Http\Requests\Subscriber\UpdatePasswordRequest;
use App\Http\Controllers\Controller;

class UpdatePasswordController extends Controller
{
    public function store(UpdatePasswordRequest $request)
    {
        $request->user('subscriber')->update([
            'password' => $request->validated('password'),
        ]);

        return response()->noContent();
    }
}
