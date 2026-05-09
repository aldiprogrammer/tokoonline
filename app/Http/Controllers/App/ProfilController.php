<?php

namespace App\Http\Controllers\app;

use App\Http\Controllers\Controller;
use App\Models\Alamat;
use App\Models\Order;
use App\Models\Pembayaran;
use App\Models\Profil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ProfilController extends Controller
{
    public function index(Request $request)
    {
        $this->syncPendingMidtransOrders($request->user()->id);

        $profil = Profil::where('id_user', $request->user()->id)->first();
        $alamat = Alamat::where('id_user', $request->user()->id)->first();
        $orders = Order::where('id_user', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('App/Profil', compact('profil', 'alamat', 'orders'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:40',
            'whatsapp' => 'required|string|max:16',
            'provinsi' => 'required|string|max:50',
            'kabupaten' => 'required|string|max:50',
            'kecamatan' => 'required|string|max:50',
            'kelurahan' => 'required|string|max:50',
            'alamat' => 'required|string|max:255',
            'kode_pos' => 'nullable|string|max:30',
        ]);

        $profil = Profil::updateOrCreate(
            ['id_user' => $request->user()->id],
            [
                'nama' => $validated['nama'],
                'whatsapp' => $validated['whatsapp'],
                'point' => Profil::where('id_user', $request->user()->id)->value('point') ?? 0,
            ]
        );

        Alamat::updateOrCreate(
            ['id_user' => $request->user()->id],
            [
                'id_profil' => $profil->id,
                'provinsi' => $validated['provinsi'],
                'kabupaten' => $validated['kabupaten'],
                'kecamatan' => $validated['kecamatan'],
                'kelurahan' => $validated['kelurahan'],
                'alamat' => $validated['alamat'],
                'kode_pos' => $validated['kode_pos'] ?? '',
            ]
        );

        return back()->with('success', 'Profil customer berhasil disimpan.');
    }

    private function syncPendingMidtransOrders(int $userId): void
    {
        if (! filled(config('services.midtrans.server_key'))) {
            return;
        }

        $baseUrl = config('services.midtrans.is_production')
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';

        Order::where('id_user', $userId)
            ->where('status_pembayaran', 0)
            ->whereNotNull('midtrans_order_id')
            ->latest()
            ->take(5)
            ->get()
            ->each(function (Order $order) use ($baseUrl) {
                $response = Http::withBasicAuth(config('services.midtrans.server_key'), '')
                    ->acceptJson()
                    ->get($baseUrl . '/v2/' . $order->midtrans_order_id . '/status');

                if ($response->failed()) {
                    return;
                }

                $transactionStatus = $response->json('transaction_status') ?: 'pending';
                $fraudStatus = $response->json('fraud_status');
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
                        'motode_pembayaran' => $response->json('payment_type') ?: 'midtrans',
                        'status' => $transactionStatus,
                    ]
                );
            });
    }
}
