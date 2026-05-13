<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Alamat;
use App\Models\Keranjang;
use App\Models\Order;
use App\Models\Pembayaran;
use App\Models\Profil;
use App\Models\SablonPrice;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $cart = $this->cartItems($request->user()->id);

        if ($cart->isEmpty()) {
            return redirect()->route('app.toko')->with('error', 'Keranjang masih kosong.');
        }

        return Inertia::render('App/Checkout', [
            'cartItems' => $this->cartPayload($cart),
            'profil' => Profil::where('id_user', $request->user()->id)->first(),
            'alamat' => Alamat::where('id_user', $request->user()->id)->first(),
            'sablonPrices' => SablonPrice::all()->map(fn ($s) => [
                'position' => $s->position,
                'label' => $s->label,
                'price' => (int) $s->price,
            ])->values()->all(),
            'checkoutConfig' => [
                'midtransReady' => filled(config('services.midtrans.server_key')),
                'rajaongkirReady' => filled(config('services.rajaongkir.key')) && filled(config('services.rajaongkir.origin_id')),
                'rajaongkirOriginId' => config('services.rajaongkir.origin_id'),
                'rajaongkirCouriers' => config('services.rajaongkir.couriers'),
                'defaultWeight' => (int) config('services.checkout.default_weight', 500),
            ],
        ]);
    }

    public function searchDestination(Request $request)
    {
        $validated = $request->validate([
            'search' => 'required|string|min:3|max:80',
        ]);

        abort_unless(filled(config('services.rajaongkir.key')), 422, 'API key RajaOngkir belum diatur.');

        $response = Http::withHeaders([
            'key' => config('services.rajaongkir.key'),
        ])->get(rtrim(config('services.rajaongkir.base_url'), '/') . '/destination/domestic-destination', [
            'search' => $validated['search'],
            'limit' => 10,
            'offset' => 0,
        ]);

        if ($response->failed()) {
            return response()->json([
                'message' => $response->json('meta.message') ?: 'Gagal mencari tujuan pengiriman.',
                'data' => [],
            ], 422);
        }

        return response()->json([
            'data' => $response->json('data') ?? [],
        ]);
    }

    public function shippingCost(Request $request)
    {
        $validated = $request->validate([
            'destination_id' => 'required|integer',
            'weight' => 'required|integer|min:1',
            'courier' => 'nullable|string|max:120',
        ]);

        abort_unless(filled(config('services.rajaongkir.key')), 422, 'API key RajaOngkir belum diatur.');
        abort_unless(filled(config('services.rajaongkir.origin_id')), 422, 'Origin ID toko RajaOngkir belum diatur.');

        $response = Http::asForm()
            ->withHeaders(['key' => config('services.rajaongkir.key')])
            ->post(rtrim(config('services.rajaongkir.base_url'), '/') . '/calculate/domestic-cost', [
                'origin' => config('services.rajaongkir.origin_id'),
                'destination' => $validated['destination_id'],
                'weight' => $validated['weight'],
                'courier' => $validated['courier'] ?: config('services.rajaongkir.couriers'),
                'price' => 'lowest',
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => $response->json('meta.message') ?: 'Gagal menghitung ongkir.',
                'data' => [],
            ], 422);
        }

        return response()->json([
            'data' => $response->json('data') ?? [],
        ]);
    }

    public function uploadSablon(Request $request)
    {
        $validated = $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg|max:2048',
            'cart_id' => 'required|integer',
        ]);

        $path = $request->file('image')->store('sablon', 'public');

        return response()->json([
            'path' => '/storage/' . $path,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_penerima' => 'required|string|max:80',
            'whatsapp' => 'required|string|max:20',
            'alamat_pengiriman' => 'required|string|max:500',
            'destination_id' => 'required|string|max:30',
            'destination_label' => 'required|string|max:255',
            'kurir' => 'required|string|max:40',
            'layanan_kurir' => 'required|string|max:80',
            'estimasi' => 'nullable|string|max:40',
            'ongkir' => 'required|integer|min:0',
            'sablon_items' => 'nullable|array',
            'sablon_items.*.cart_id' => 'required|integer',
            'sablon_items.*.position' => 'nullable|string|max:50',
            'sablon_items.*.price' => 'nullable|integer|min:0',
            'sablon_items.*.image' => 'nullable|string|max:255',
        ]);

        $cart = $this->cartItems($request->user()->id);
        abort_if($cart->isEmpty(), 422, 'Keranjang masih kosong.');

        $sablonItems = collect($validated['sablon_items'] ?? [])->keyBy('cart_id');
        $sablonTotal = $sablonItems->sum(fn ($s) => isset($s['price']) ? (int) $s['price'] : 0);
        $subtotal = $cart->sum(fn ($item) => (int) $item->harga * (int) $item->qty) + $sablonTotal;
        $grandTotal = $subtotal + (int) $validated['ongkir'];
        $kodeOrder = 'ORD-' . now()->format('YmdHis') . '-' . $request->user()->id;
        $midtransOrderId = $kodeOrder . '-' . Str::upper(Str::random(5));

        $order = DB::transaction(function () use ($request, $validated, $cart, $subtotal, $grandTotal, $kodeOrder, $midtransOrderId, $sablonItems) {
            $order = Order::create([
                'kode_order' => $kodeOrder,
                'id_user' => $request->user()->id,
                'nama_penerima' => $validated['nama_penerima'],
                'whatsapp' => $validated['whatsapp'],
                'alamat_pengiriman' => $validated['alamat_pengiriman'],
                'destination_id' => $validated['destination_id'],
                'destination_label' => $validated['destination_label'],
                'kurir' => $validated['kurir'],
                'layanan_kurir' => $validated['layanan_kurir'],
                'estimasi' => $validated['estimasi'] ?? '',
                'subtotal' => $subtotal,
                'ongkir' => (int) $validated['ongkir'],
                'total_harga' => $grandTotal,
                'midtrans_order_id' => $midtransOrderId,
                'status_pembayaran' => 0,
                'status_midtrans' => 'pending',
                'status_pengiriman' => 0,
                'tanggal' => now()->format('Y-m-d'),
            ]);

            $cart->each(function ($item) use ($order, $sablonItems) {
                $sablon = $sablonItems->get($item->id);
                $sablonPrice = isset($sablon['price']) ? (int) $sablon['price'] : 0;

                $order->items()->create([
                    'produk_id' => $item->id_produk,
                    'nama_produk' => $item->produk?->nama_produk ?: 'Produk',
                    'ukuran' => $item->ukuran,
                    'harga' => (int) $item->harga,
                    'qty' => (int) $item->qty,
                    'total_harga' => (int) $item->harga * (int) $item->qty,
                    'image' => $item->produk?->gambarproduk?->first()?->image
                        ? '/storage/' . $item->produk->gambarproduk->first()->image
                        : null,
                    'sablon_position' => $sablon['position'] ?? null,
                    'sablon_price' => $sablonPrice,
                    'sablon_image' => $sablon['image'] ?? null,
                ]);

                $product = $item->produk;
                if ($product) {
                    $newStok = max(0, (int) $product->stok - (int) $item->qty);
                    $product->update(['stok' => (string) $newStok]);
                }
            });

            Keranjang::where('id_user', $request->user()->id)->delete();

            return $order;
        });

        if (! filled(config('services.midtrans.server_key'))) {
            return response()->json([
                'message' => 'Order dibuat. API key Midtrans belum diatur, jadi link pembayaran belum dibuat.',
                'order' => $order,
                'cart' => [],
            ]);
        }

        $transaction = $this->createMidtransTransaction($request, $order, $this->midtransCartItems($cart, $order));

        $order->update([
            'midtrans_token' => $transaction['token'] ?? null,
            'midtrans_redirect_url' => $transaction['redirect_url'] ?? null,
        ]);

        Pembayaran::updateOrCreate(
            ['kode_order' => $order->kode_order],
            [
                'kode_invoice' => $order->midtrans_order_id,
                'motode_pembayaran' => 'midtrans',
                'status' => 'pending',
            ]
        );

        return response()->json([
            'message' => 'Order berhasil dibuat. Silakan lanjutkan pembayaran.',
            'order' => $order->fresh(),
            'payment' => [
                'token' => $transaction['token'] ?? null,
                'redirect_url' => $transaction['redirect_url'] ?? null,
            ],
            'cart' => [],
        ]);
    }

    public function notification(Request $request)
    {
        abort_unless(filled(config('services.midtrans.server_key')), 422, 'API key Midtrans belum diatur.');

        $signature = hash('sha512', $request->order_id . $request->status_code . $request->gross_amount . config('services.midtrans.server_key'));
        abort_unless(hash_equals($signature, (string) $request->signature_key), 403, 'Signature Midtrans tidak valid.');

        $order = Order::where('midtrans_order_id', $request->order_id)->firstOrFail();
        $transactionStatus = $request->transaction_status ?: 'pending';
        $fraudStatus = $request->fraud_status;

        $isPaid = in_array($transactionStatus, ['capture', 'settlement'], true)
            && ($transactionStatus !== 'capture' || $fraudStatus === 'accept');

        $order->update([
            'status_pembayaran' => $isPaid ? 1 : 0,
            'status_midtrans' => $transactionStatus,
        ]);

        Pembayaran::updateOrCreate(
            ['kode_order' => $order->kode_order],
            [
                'kode_invoice' => $order->midtrans_order_id,
                'motode_pembayaran' => $request->payment_type ?: 'midtrans',
                'status' => $transactionStatus,
            ]
        );

        return response()->json(['message' => 'OK']);
    }

    public function pay(Request $request, Order $order)
    {
        abort_unless((int) $order->id_user === (int) $request->user()->id, 403);

        if ((int) $order->status_pembayaran > 0) {
            return response()->json([
                'message' => 'Order ini sudah dibayar.',
                'order' => $order,
            ], 422);
        }

        if ($order->midtrans_redirect_url && ! in_array($order->status_midtrans, ['expire', 'cancel', 'deny', 'failure'], true)) {
            return response()->json([
                'message' => 'Silakan lanjutkan pembayaran.',
                'payment' => [
                    'token' => $order->midtrans_token,
                    'redirect_url' => $order->midtrans_redirect_url,
                ],
            ]);
        }

        abort_unless(filled(config('services.midtrans.server_key')), 422, 'API key Midtrans belum diatur.');

        $order->update([
            'midtrans_order_id' => $order->kode_order . '-' . Str::upper(Str::random(5)),
            'midtrans_token' => null,
            'midtrans_redirect_url' => null,
            'status_midtrans' => 'pending',
        ]);

        $transaction = $this->createMidtransTransaction($request, $order->fresh(), [[
            'id' => $order->kode_order,
            'price' => (int) $order->total_harga,
            'quantity' => 1,
            'name' => Str::limit('Tagihan ' . $order->kode_order, 45, ''),
        ]]);

        $order->update([
            'midtrans_token' => $transaction['token'] ?? null,
            'midtrans_redirect_url' => $transaction['redirect_url'] ?? null,
        ]);

        Pembayaran::updateOrCreate(
            ['kode_order' => $order->kode_order],
            [
                'kode_invoice' => $order->fresh()->midtrans_order_id,
                'motode_pembayaran' => 'midtrans',
                'status' => 'pending',
            ]
        );

        return response()->json([
            'message' => 'Link pembayaran berhasil dibuat.',
            'payment' => [
                'token' => $order->fresh()->midtrans_token,
                'redirect_url' => $order->fresh()->midtrans_redirect_url,
            ],
        ]);
    }

    private function createMidtransTransaction(Request $request, Order $order, array $items): array
    {
        $baseUrl = config('services.midtrans.is_production')
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';

        $response = Http::withBasicAuth(config('services.midtrans.server_key'), '')
            ->acceptJson()
            ->post($baseUrl . '/snap/v1/transactions', [
                'transaction_details' => [
                    'order_id' => $order->midtrans_order_id,
                    'gross_amount' => (int) $order->total_harga,
                ],
                'item_details' => $items,
                'customer_details' => [
                    'first_name' => $order->nama_penerima,
                    'email' => $request->user()->email,
                    'phone' => $order->whatsapp,
                    'shipping_address' => [
                        'first_name' => $order->nama_penerima,
                        'phone' => $order->whatsapp,
                        'address' => $order->alamat_pengiriman,
                    ],
                ],
                'callbacks' => [
                    'finish' => route('profil'),
                    'unfinish' => route('profil'),
                    'error' => route('profil'),
                ],
            ]);

        abort_if($response->failed(), 422, $response->json('error_messages.0') ?: 'Gagal membuat transaksi Midtrans.');

        return $response->json();
    }

    private function cartItems(int $userId)
    {
        return Keranjang::with('produk.gambarproduk')
            ->where('id_user', $userId)
            ->latest()
            ->get();
    }

    private function cartPayload($cart): array
    {
        return $cart->map(function ($item) {
            $images = $item->produk?->gambarproduk ?? collect();
            $defaultImage = 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80';

            $imageByPos = [];
            foreach ($images as $g) {
                $imageByPos[$g->posisi ?? 'default'] = '/storage/' . $g->image;
            }

            return [
                'id' => $item->id,
                'product_id' => $item->id_produk,
                'nama_produk' => $item->produk?->nama_produk,
                'harga' => (int) $item->harga,
                'harga_asli' => (int) ($item->produk?->harga ?? $item->harga),
                'diskon' => (int) ($item->produk?->diskon ?? 0),
                'qty' => (int) $item->qty,
                'ukuran' => $item->ukuran,
                'total_harga' => (int) $item->harga * (int) $item->qty,
                'image' => $imageByPos['depan'] ?? $imageByPos['default'] ?? $defaultImage,
                'images' => [
                    'depan' => $imageByPos['depan'] ?? null,
                    'samping' => $imageByPos['samping'] ?? null,
                    'belakang' => $imageByPos['belakang'] ?? null,
                ],
            ];
        })->values()->all();
    }

    private function midtransCartItems($cart, Order $order): array
    {
        $items = $cart->map(fn ($item) => [
            'id' => (string) $item->id_produk,
            'price' => (int) $item->harga,
            'quantity' => (int) $item->qty,
            'name' => Str::limit($item->produk?->nama_produk ?: 'Produk', 45, ''),
        ])->values()->all();

        $order->items->each(function ($item) use (&$items) {
            if ($item->sablon_position && $item->sablon_price) {
                $items[] = [
                    'id' => 'SABLON-' . $item->produk_id,
                    'price' => (int) $item->sablon_price,
                    'quantity' => (int) $item->qty,
                    'name' => Str::limit('Sablon ' . $item->nama_produk, 45, ''),
                ];
            }
        });

        $items[] = [
            'id' => 'ONGKIR',
            'price' => (int) $order->ongkir,
            'quantity' => 1,
            'name' => Str::limit('Ongkir ' . $order->kurir . ' ' . $order->layanan_kurir, 45, ''),
        ];

        return $items;
    }
}
