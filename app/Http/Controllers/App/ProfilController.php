<?php

namespace App\Http\Controllers\App;

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
        $alamats = Alamat::where('id_user', $request->user()->id)->orderByDesc('alamat_utama')->get();
        $orders = Order::with(['items', 'reviews'])
            ->where('id_user', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('App/Profil', [
            'profil' => $profil,
            'alamat' => $alamats->first(),
            'alamatList' => $alamats,
            'orders' => $orders,
            'profileConfig' => [
                'rajaongkirReady' => filled(config('services.rajaongkir.key')),
            ],
        ]);
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
            'rajaongkir_destination_id' => 'nullable|string|max:30',
            'rajaongkir_destination_label' => 'nullable|string|max:255',
        ]);

        $userId = $request->user()->id;

        $profil = Profil::updateOrCreate(
            ['id_user' => $userId],
            [
                'nama' => $validated['nama'],
                'whatsapp' => $validated['whatsapp'],
                'point' => Profil::where('id_user', $userId)->value('point') ?? 0,
            ]
        );

        $primary = Alamat::where('id_user', $userId)->where('alamat_utama', true)->first();

        if ($primary) {
            $this->saveAlamat($userId, $profil->id, $validated, $primary, true);
        } else {
            Alamat::where('id_user', $userId)->update(['alamat_utama' => false]);
            Alamat::create(array_merge($this->alamatFields($profil->id, $validated), ['id_user' => $userId, 'alamat_utama' => true]));
        }

        return back()->with('success', 'Profil customer berhasil disimpan.');
    }

    public function storeAlamat(Request $request)
    {
        $validated = $this->validateAlamat($request);

        $userId = $request->user()->id;
        $profil = Profil::firstOrCreate(
            ['id_user' => $userId],
            ['nama' => $request->user()->name, 'whatsapp' => '', 'point' => 0]
        );

        $alamatCount = Alamat::where('id_user', $userId)->count();

        Alamat::create(array_merge(
            $this->alamatFields($profil->id, $validated),
            ['id_user' => $userId, 'alamat_utama' => $alamatCount === 0]
        ));

        return back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function updateAlamat(Request $request, $id)
    {
        $alamat = Alamat::where('id_user', $request->user()->id)->findOrFail($id);
        $validated = $this->validateAlamat($request);

        $this->saveAlamat(
            $request->user()->id,
            $alamat->id_profil,
            $validated,
            $alamat,
            (bool) $alamat->alamat_utama
        );

        return back()->with('success', 'Alamat berhasil diperbarui.');
    }

    public function destroyAlamat(Request $request, $id)
    {
        $alamat = Alamat::where('id_user', $request->user()->id)->findOrFail($id);
        $wasPrimary = (bool) $alamat->alamat_utama;

        $alamat->delete();

        if ($wasPrimary) {
            $next = Alamat::where('id_user', $request->user()->id)->orderBy('id')->first();
            if ($next) {
                $next->update(['alamat_utama' => true]);
            }
        }

        return back()->with('success', 'Alamat berhasil dihapus.');
    }

    public function setAlamatUtama(Request $request, $id)
    {
        $alamat = Alamat::where('id_user', $request->user()->id)->findOrFail($id);

        Alamat::where('id_user', $request->user()->id)->update(['alamat_utama' => false]);
        $alamat->update(['alamat_utama' => true]);

        return back()->with('success', 'Alamat utama berhasil diubah.');
    }

    private function validateAlamat(Request $request): array
    {
        return $request->validate([
            'provinsi' => 'required|string|max:50',
            'kabupaten' => 'required|string|max:50',
            'kecamatan' => 'required|string|max:50',
            'kelurahan' => 'required|string|max:50',
            'alamat' => 'required|string|max:255',
            'kode_pos' => 'nullable|string|max:30',
            'rajaongkir_destination_id' => 'nullable|string|max:30',
            'rajaongkir_destination_label' => 'nullable|string|max:255',
        ]);
    }

    private function alamatFields(int $profilId, array $data): array
    {
        return [
            'id_profil' => $profilId,
            'provinsi' => $data['provinsi'],
            'kabupaten' => $data['kabupaten'],
            'kecamatan' => $data['kecamatan'],
            'kelurahan' => $data['kelurahan'],
            'alamat' => $data['alamat'],
            'kode_pos' => $data['kode_pos'] ?? '',
            'rajaongkir_destination_id' => $data['rajaongkir_destination_id'] ?? null,
            'rajaongkir_destination_label' => $data['rajaongkir_destination_label'] ?? null,
        ];
    }

    private function saveAlamat(int $userId, int $profilId, array $data, ?Alamat $alamat, bool $isPrimary): Alamat
    {
        $fields = $this->alamatFields($profilId, $data);

        if ($isPrimary) {
            Alamat::where('id_user', $userId)->update(['alamat_utama' => false]);
            $fields['alamat_utama'] = true;
        }

        $alamat->update($fields);

        return $alamat;
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
