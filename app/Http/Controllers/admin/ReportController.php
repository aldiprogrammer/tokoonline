<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->query('bulan', now()->format('m'));
        $tahun = $request->query('tahun', now()->format('Y'));

        $orders = Order::whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->where('status_pembayaran', '>', 0)
            ->orderBy('tanggal')
            ->get()
            ->map(function ($o) {
                return [
                    'tanggal' => $o->tanggal,
                    'kode_order' => $o->kode_order,
                    'nama_penerima' => $o->nama_penerima,
                    'total_harga' => (int) $o->total_harga,
                    'status_pengiriman' => (int) $o->status_pengiriman,
                ];
            });

        $grouped = $orders->groupBy('tanggal')->map(function ($items, $tgl) {
            return [
                'tanggal' => $tgl,
                'jumlah_order' => $items->count(),
                'total_penjualan' => $items->sum('total_harga'),
                'items' => $items,
            ];
        })->values();

        $grandTotal = $orders->sum('total_harga');

        return Inertia::render('Admin/Laporan', [
            'grouped' => $grouped,
            'grandTotal' => $grandTotal,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'totalOrder' => $orders->count(),
            'bulanList' => [
                ['value' => '01', 'label' => 'Januari'],
                ['value' => '02', 'label' => 'Februari'],
                ['value' => '03', 'label' => 'Maret'],
                ['value' => '04', 'label' => 'April'],
                ['value' => '05', 'label' => 'Mei'],
                ['value' => '06', 'label' => 'Juni'],
                ['value' => '07', 'label' => 'Juli'],
                ['value' => '08', 'label' => 'Agustus'],
                ['value' => '09', 'label' => 'September'],
                ['value' => '10', 'label' => 'Oktober'],
                ['value' => '11', 'label' => 'November'],
                ['value' => '12', 'label' => 'Desember'],
            ],
            'tahunList' => collect(range(now()->year - 3, now()->year))->map(fn ($t) => ['value' => (string) $t, 'label' => (string) $t]),
        ]);
    }

    public function exportPdf(Request $request)
    {
        $bulan = $request->query('bulan', now()->format('m'));
        $tahun = $request->query('tahun', now()->format('Y'));

        $orders = Order::whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->where('status_pembayaran', '>', 0)
            ->orderBy('tanggal')
            ->get();

        $grouped = $orders->groupBy('tanggal')->map(function ($items, $tgl) {
            return [
                'tanggal' => $tgl,
                'jumlah_order' => $items->count(),
                'total_penjualan' => $items->sum('total_harga'),
                'items' => $items,
            ];
        })->values();

        $grandTotal = $orders->sum('total_harga');
        $namaBulan = [
            '01' => 'Januari', '02' => 'Februari', '03' => 'Maret', '04' => 'April',
            '05' => 'Mei', '06' => 'Juni', '07' => 'Juli', '08' => 'Agustus',
            '09' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
        ];

        $pdf = Pdf::loadView('pdf.laporan', [
            'grouped' => $grouped,
            'grandTotal' => $grandTotal,
            'bulan' => $namaBulan[$bulan] ?? $bulan,
            'tahun' => $tahun,
            'totalOrder' => $orders->count(),
        ]);

        return $pdf->download("laporan-penjualan-{$bulan}-{$tahun}.pdf");
    }
}
