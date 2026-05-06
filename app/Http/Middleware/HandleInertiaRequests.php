<?php

namespace App\Http\Middleware;

use App\Models\Keranjang;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'cart' => fn () => $request->user()
                ? Keranjang::with('produk.gambarproduk')
                    ->where('id_user', $request->user()->id)
                    ->latest()
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->id_produk,
                            'nama_produk' => $item->produk?->nama_produk,
                            'harga' => (int) $item->harga,
                            'qty' => (int) $item->qty,
                            'stok' => (int) ($item->produk?->stok ?? 0),
                            'ukuran' => $item->ukuran,
                            'image' => $item->produk?->gambarproduk?->first()?->image
                                ? '/storage/' . $item->produk->gambarproduk->first()->image
                                : 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80',
                            'total_harga' => (int) $item->total_harga,
                        ];
                    })
                    ->values()
                    ->all()
                : [],
            'pengguna' => fn () => $request->session()->get('pengguna'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
