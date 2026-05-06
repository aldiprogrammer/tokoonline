<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Socialite;

class GoogleController extends Controller
{
    function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    function callback()
    {
        $googleUser = Socialite::driver('google')->user();
        $user = User::firstOrNew(['email' => $googleUser->getEmail()]);

        $user->name = $googleUser->getName();
        $user->google_id = $googleUser->getId();
        $user->avatar = $googleUser->getAvatar();

        if (!$user->exists) {
            $user->password = Hash::make(Str::random(32));
        }

        $user->save();

        Auth::login($user);
        return redirect()->route('toko')->with('success', 'Login Google berhasil');

        // dd($googleUser);
    }
}
