<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\ProductReview;
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

        $reviews = ProductReview::with('user')
            ->where('produk_id', $produk->id)
            ->latest()
            ->limit(4)
            ->get();

        $reviewSummary = [
            'count' => ProductReview::where('produk_id', $produk->id)->count(),
            'average' => round((float) ProductReview::where('produk_id', $produk->id)->avg('rating'), 1),
        ];

        return Inertia::render('App/DetailProduk', compact('produk', 'produkTerkait', 'reviews', 'reviewSummary'));
    }
}
