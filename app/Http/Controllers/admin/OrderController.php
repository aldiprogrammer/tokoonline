<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Order', [
            'orders' => Order::with('items.produk')->latest()->paginate(10),
            'statusPengiriman' => $this->statusPengiriman(),
        ]);
    }

    public function hariIni()
    {
        return Inertia::render('Admin/OrderHariIni', [
            'orders' => Order::with('user', 'items.produk')
                ->whereDate('tanggal', today())
                ->latest()
                ->paginate(10),
            'statusPengiriman' => $this->statusPengiriman(),
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status_pengiriman' => 'required|integer|in:0,1,2,3',
        ]);

        $order->update([
            'status_pengiriman' => $validated['status_pengiriman'],
        ]);

        return back()->with('success', 'Status pengiriman berhasil diperbarui.');
    }

    public function updateResi(Request $request, Order $order)
    {
        $validated = $request->validate([
            'no_resi' => 'required|string|max:100',
        ]);

        $order->update([
            'no_resi' => $validated['no_resi'],
        ]);

        return back()->with('success', 'Nomor resi berhasil disimpan.');
    }

    public function track(Request $request, Order $order)
    {
        if (auth()->check() && (int) $order->id_user !== (int) auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke order ini.');
        }

        abort_unless(filled(config('services.rajaongkir.key')), 422, 'API key RajaOngkir belum diatur.');
        abort_unless($order->no_resi, 422, 'Nomor resi belum diinput.');
        abort_unless($order->kurir, 422, 'Kurir tidak diketahui.');

        $response = Http::withHeaders([
            'key' => config('services.rajaongkir.key'),
        ])->post(rtrim(config('services.rajaongkir.base_url'), '/') . '/waybill', [
            'waybill' => $order->no_resi,
            'courier' => strtolower($order->kurir),
        ]);

        if ($response->failed()) {
            return response()->json([
                'message' => $response->json('meta.message') ?: 'Gagal melacak resi.',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'data' => $response->json('data') ?? [],
        ]);
    }

    private function statusPengiriman(): array
    {
        return [
            ['value' => 0, 'label' => 'Pesanan dibuat'],
            ['value' => 1, 'label' => 'Sudah dikemas'],
            ['value' => 2, 'label' => 'Dalam perjalanan'],
            ['value' => 3, 'label' => 'Sudah sampai'],
        ];
    }
}
