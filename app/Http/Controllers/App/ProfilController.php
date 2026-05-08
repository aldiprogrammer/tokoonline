<?php

namespace App\Http\Controllers\app;

use App\Http\Controllers\Controller;
use App\Models\Alamat;
use App\Models\Order;
use App\Models\Profil;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfilController extends Controller
{
    public function index(Request $request)
    {
        $profil = Profil::where('id_user', $request->user()->id)->first();
        $alamat = Alamat::where('id_user', $request->user()->id)->first();
        $orders = Order::where('id_user', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('App/Profil', compact('profil', 'alamat', 'orders'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:40',
            'whatsapp' => 'required|string|max:16',
            'provinsi' => 'required|string|max:50',
            'kabupaten' => 'required|string|max:50',
            'kecamatan' => 'required|string|max:50',
            'kelurahan' => 'required|string|max:50',
            'alamat' => 'required|string|max:255',
            'kode_pos' => 'nullable|string|max:30',
        ]);

        $profil = Profil::updateOrCreate(
            ['id_user' => $request->user()->id],
            [
                'nama' => $validated['nama'],
                'whatsapp' => $validated['whatsapp'],
                'point' => Profil::where('id_user', $request->user()->id)->value('point') ?? 0,
            ]
        );

        Alamat::updateOrCreate(
            ['id_user' => $request->user()->id],
            [
                'id_profil' => $profil->id,
                'provinsi' => $validated['provinsi'],
                'kabupaten' => $validated['kabupaten'],
                'kecamatan' => $validated['kecamatan'],
                'kelurahan' => $validated['kelurahan'],
                'alamat' => $validated['alamat'],
                'kode_pos' => $validated['kode_pos'] ?? '',
            ]
        );

        return back()->with('success', 'Profil customer berhasil disimpan.');
    }
}
