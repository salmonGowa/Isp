<?php

namespace App\Domain\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $staff = $request->user('staff');

        abort_if(! $staff, 401);
        abort_unless(in_array($staff->role->value, $roles, true), 403, 'This action requires one of these roles: '.implode(', ', $roles));

        return $next($request);
    }
}
