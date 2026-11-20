<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        abort_unless($user?->status === 'active', 403, 'Your account is inactive. Contact support.');

        if ($user && ! $user->hasVerifiedEmail()) {
            abort(403, 'Your email address is not verified. Please verify your email with the OTP sent to your inbox.');
        }

        return $next($request);
    }
}
