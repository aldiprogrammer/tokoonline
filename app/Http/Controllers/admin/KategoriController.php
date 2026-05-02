<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class KategoriController extends Controller
{
    function index()
    {
        $kategori = Kategori::all();
        return Inertia::render('Admin/Kategori', compact('kategori'));
    }

    function store(Request $request)
    {
        $kt = new Kategori();
        $kt->kategori = $request->kategori;
        $kt->save();
        return redirect()->back()->with('success', 'Data berhasil ditambah');
    }

    function update(Request $request, $id)
    {
        $kt = Kategori::find($id);
        $kt->kategori = $request->kategori;
        $kt->save();
        return redirect()->back()->with('success', 'Data berhasil diubah');
    }

    function delete($id)
    {
        $kt = Kategori::find($id);
        $kt->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}
