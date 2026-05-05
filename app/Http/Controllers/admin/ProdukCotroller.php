<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Gambarprodk;
use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProdukCotroller extends Controller
{
    function index()
    {
        $produk = Produk::all();
        return Inertia::render('Admin/Produk', compact('produk'));
    }

    function show()
    {
        $kode = 'PRD-' . rand(0, 100000);
        $kategori = Kategori::all();
        return Inertia::render('Admin/Tambahproduk', compact('kode', 'kategori'));
    }

    function store(Request $request)

    {

        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $path = $request->file('image')->store('produk', 'public');

        $pr = new Produk();
        $slug = Str::slug($request->nama);
        $pr->kode_produk = $request->kode;
        $pr->nama_produk = $request->nama;
        $pr->id_kategori = $request->kategori_id;
        $pr->ukuran = $request->ukuran;
        $pr->harga = $request->harga;
        $pr->diskon = $request->diskon;
        $pr->harga_diskon = 000;
        $pr->slug = $slug;

        $pr->stok = $request->stok;
        $pr->save();

        $img = new Gambarprodk();
        $img->id_produk = $pr->id;
        $img->image = $path;
        $img->save();


        return redirect()->route('admin.tambahproduk')->with('success', 'Data berhasil ditambah');
    }
}
