<?php

namespace App\Domain\Auth\Http\Controllers\Staff;

use App\Domain\Auth\Http\Requests\StaffLoginRequest;
use App\Domain\Staff\Http\Resources\StaffResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class StaffAuthController extends Controller
{
    public function login(StaffLoginRequest $request)
    {
        if (! Auth::guard('staff')->attempt($request->validated())) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $request->session()->regenerate();

        $staff = Auth::guard('staff')->user();
        $staff->forceFill(['last_active_at' => now()])->save();

        return new StaffResource($staff);
    }

    public function logout(Request $request)
    {
        Auth::guard('staff')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return new StaffResource($request->user('staff'));
    }
}
