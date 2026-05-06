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
}
