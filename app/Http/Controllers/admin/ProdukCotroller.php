<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        return Inertia::render('Admin/Tambahproduk', compact('kode'));
    }

    function store(Request $request)
    {
        $pr = new Produk();
        $pr->kode_produk = $request->kode_produk;
        $pr->nama_produk = $request->nama_produk;
        $pr->id_kategori = $request->kategori;
        $pr->ukuran = $request->ukuran;
        $pr->harga = $request->harga;
        $pr->diskon = $request->diskon;
        $pr->harga_diskon = $request->harga_diskon;
        $pr->stok = $request->stok;
        $pr->save();
        return redirect()->back()->with('success', 'Data berhasil ditambah');
    }
}
