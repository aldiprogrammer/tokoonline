<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Ratio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RatioController extends Controller
{
    function index()
    {
        $ratio = Ratio::all();
        return Inertia::render('Admin/Ratio', compact('ratio'));
    }

    function store(Request $request)
    {
        $rt = new Ratio();
        $rt->ratio = $request->ratio;
        $rt->save();
        return redirect()->back()->with('success', 'Data berhasil ditambah');
    }

    function update(Request $request, $id)
    {
        $rt = Ratio::find($id);
        $rt->ratio = $request->ratio;
        $rt->save();
        return redirect()->back()->with('success', 'Data berhasil diubah');
    }

    function delete($id)
    {
        $rt = Ratio::find($id);
        $rt->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}