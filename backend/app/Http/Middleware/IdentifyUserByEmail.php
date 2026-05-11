<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IdentifyUserByEmail
{
    public function handle(Request $request, Closure $next): Response
    {
        $email = $request->header('X-User-Email');

        if ($email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                Auth::setUser($user);
            }
        }

        return $next($request);
    }
}
