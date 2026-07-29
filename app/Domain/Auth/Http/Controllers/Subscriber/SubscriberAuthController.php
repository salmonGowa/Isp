<?php

namespace App\Domain\Auth\Http\Controllers\Subscriber;

use App\Domain\Auth\Http\Requests\SubscriberLoginRequest;
use App\Domain\Subscribers\Http\Resources\SubscriberResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SubscriberAuthController extends Controller
{
    public function login(SubscriberLoginRequest $request)
    {
        if (! Auth::guard('subscriber')->attempt($request->validated())) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $request->session()->regenerate();

        return new SubscriberResource(Auth::guard('subscriber')->user());
    }

    public function logout(Request $request)
    {
        Auth::guard('subscriber')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return new SubscriberResource($request->user('subscriber')->load('plan'));
    }
}
