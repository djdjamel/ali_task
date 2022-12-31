<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (auth()->user() && auth()->user()->type == 'admin') {
            if (auth()->user()->type == 'admin') {
                return $next($request);
            }
        }
        return response()->json('Action forbidden. you do not have admin rights.'.auth()->user()->type.auth()->user()->name, 401);
    }
}
