<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PenggunaController extends Controller
{
    function index()
    {
        $role = Role::all();
        $pengguna = Pengguna::with('role')->get();
        $menuList = collect(Pengguna::menus())
            ->map(fn ($label, $key) => ['key' => $key, 'label' => $label])
            ->values();
        return Inertia::render('Admin/Pengguna', compact('role', 'pengguna', 'menuList'));
    }

    function store(Request $request)
    {
        $pg = new Pengguna();
        $pg->id_role = $request->role;
        $pg->username = $request->username;
        $pg->password = Hash::make($request->password);
        $pg->hak_akses = $request->hak_akses ?? [];
        $pg->save();
        return redirect()->back()->with('success', 'Data berhasil ditambah');
    }

    function update(Request $request, $id)
    {


        $pg = Pengguna::find($id);
        $pg->id_role = $request->role;
        $pg->username = $request->username;
        if ($request->password != null) {
            $pg->password = Hash::make($request->password);
        }
        $pg->hak_akses = $request->hak_akses ?? [];
        $pg->update();
        return redirect()->back()->with('success', 'Data berhasil diubah');
    }

    function delete($id)
    {
        $pg = Pengguna::find($id);
        $pg->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}
