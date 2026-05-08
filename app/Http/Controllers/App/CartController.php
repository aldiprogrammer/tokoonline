<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Keranjang;
use App\Models\Order;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:produks,id',
            'qty' => 'required|integer|min:1',
            'ukuran' => 'required|string',
        ]);

        $produk = Produk::findOrFail($request->product_id);
        $allowedSizes = $produk->ukuran ? explode(',', $produk->ukuran) : [];

        abort_unless(in_array($request->ukuran, $allowedSizes, true), 422, 'Ukuran tidak valid');

        $cart = Keranjang::where('id_user', $request->user()->id)
            ->where('id_produk', $produk->id)
            ->where('ukuran', $request->ukuran)
            ->first();

        $qty = $cart
            ? min($cart->qty + $request->qty, (int) $produk->stok)
            : min($request->qty, (int) $produk->stok);

        if ($cart) {
            $cart->qty = $qty;
            $cart->total_harga = (int) $produk->harga * $qty;
            $cart->save();
        } else {
            $cart = new Keranjang();
            $cart->id_user = $request->user()->id;
            $cart->kode_order = 'CART-' . $request->user()->id;
            $cart->id_produk = $produk->id;
            $cart->ukuran = $request->ukuran;
            $cart->harga = $produk->harga;
            $cart->qty = $qty;
            $cart->total_harga = (int) $produk->harga * $qty;
            $cart->tanggal = now()->format('Y-m-d');
            $cart->save();
        }

        return response()->json([
            'message' => 'Produk ditambahkan ke keranjang',
            'cart' => $this->cartPayload($request->user()->id),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $cart = Keranjang::with('produk')
            ->where('id_user', $request->user()->id)
            ->findOrFail($id);

        $cart->qty = min($request->qty, (int) $cart->produk->stok);
        $cart->total_harga = (int) $cart->harga * (int) $cart->qty;
        $cart->save();

        return response()->json([
            'message' => 'Keranjang diperbarui',
            'cart' => $this->cartPayload($request->user()->id),
        ]);
    }

    public function delete(Request $request, $id)
    {
        $cart = Keranjang::where('id_user', $request->user()->id)->findOrFail($id);
        $cart->delete();

        return response()->json([
            'message' => 'Item dihapus dari keranjang',
            'cart' => $this->cartPayload($request->user()->id),
        ]);
    }

    public function clear(Request $request)
    {
        Keranjang::where('id_user', $request->user()->id)->delete();

        return response()->json([
            'message' => 'Keranjang dikosongkan',
            'cart' => [],
        ]);
    }

    public function checkout(Request $request)
    {
        $cart = Keranjang::where('id_user', $request->user()->id)->get();

        abort_if($cart->isEmpty(), 422, 'Keranjang masih kosong');

        $total = $cart->sum(function ($item) {
            return (int) $item->harga * (int) $item->qty;
        });

        $order = DB::transaction(function () use ($request, $total) {
            $order = Order::create([
                'kode_order' => 'ORD-' . now()->format('YmdHis') . '-' . $request->user()->id,
                'id_user' => $request->user()->id,
                'total_harga' => $total,
                'status_pembayaran' => 0,
                'tanggal' => now()->format('Y-m-d'),
            ]);

            Keranjang::where('id_user', $request->user()->id)->delete();

            return $order;
        });

        return response()->json([
            'message' => 'Checkout berhasil dibuat',
            'order' => $order,
            'cart' => [],
        ]);
    }

    private function cartPayload(int $userId): array
    {
        return Keranjang::with('produk.gambarproduk')
            ->where('id_user', $userId)
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
            ->all();
    }
}
