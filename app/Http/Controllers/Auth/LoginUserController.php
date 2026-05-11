<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginUserController extends Controller
{
    function index()
    {
        if (Auth::check()) {
            return redirect()->route('toko');
        }

        return Inertia::render('Auth/Loginuser');
    }

    function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('toko', absolute: false));
    }

    function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('toko')->with('success', 'Logout berhasil');
    }
}
