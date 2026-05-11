<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'produk_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'required|string|min:5|max:500',
        ]);

        $order = Order::with('items')
            ->where('id_user', $request->user()->id)
            ->findOrFail($validated['order_id']);

        abort_unless((int) $order->status_pembayaran > 0, 422, 'Review bisa diberikan setelah pembayaran berhasil.');
        abort_unless((int) $order->status_pengiriman === 3, 422, 'Review bisa diberikan setelah produk sudah sampai.');

        $hasProduct = $order->items->contains(fn ($item) => (int) $item->produk_id === (int) $validated['produk_id']);
        abort_unless($hasProduct, 422, 'Produk ini tidak ditemukan di order tersebut.');

        ProductReview::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'order_id' => $order->id,
                'produk_id' => $validated['produk_id'],
            ],
            [
                'rating' => $validated['rating'],
                'komentar' => $validated['komentar'],
            ]
        );

        return back()->with('success', 'Review produk berhasil disimpan.');
    }
}
