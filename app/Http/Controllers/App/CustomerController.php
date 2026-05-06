<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Produk;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $kategori = Kategori::orderBy('kategori')->get();
        $produk = Produk::with(['kategoriproduk', 'gambarproduk'])
            ->latest()
            ->get();

        return Inertia::render('App/Toko', compact('kategori', 'produk'));
    }

    public function detail($slug)
    {
        $produk = Produk::with(['kategoriproduk', 'gambarproduk'])
            ->where('slug', $slug)
            ->firstOrFail();

        $produkTerkait = Produk::with(['kategoriproduk', 'gambarproduk'])
            ->where('id', '!=', $produk->id)
            ->where('id_kategori', $produk->id_kategori)
            ->latest()
            ->limit(4)
            ->get();

        return Inertia::render('App/DetailProduk', compact('produk', 'produkTerkait'));
    }
}
