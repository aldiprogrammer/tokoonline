<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PenggunaLoginController extends Controller
{
    public function show()
    {
        if (session()->has('pengguna')) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Auth/LoginPengguna');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $pengguna = Pengguna::with('role')
            ->where('username', $request->username)
            ->first();

        if (!$pengguna || !Hash::check($request->password, $pengguna->password)) {
            return redirect()->back()
                ->withErrors(['username' => 'Username atau password salah.'])
                ->onlyInput('username');
        }

        $request->session()->regenerate();
        $request->session()->put('pengguna', [
            'id' => $pengguna->id,
            'username' => $pengguna->username,
            'role_id' => $pengguna->id_role,
            'role' => $pengguna->role?->role,
            'hak_akses' => $pengguna->hak_akses ?? [],
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Login berhasil');
    }

    public function logout(Request $request)
    {
        $request->session()->forget('pengguna');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Logout berhasil');
    }
}
