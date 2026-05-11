<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();
        $totalProduk = Produk::count();
        $totalOrders = Order::count();
        $totalRevenue = (int) Order::where('status_pembayaran', '>', 0)->sum('total_harga');
        $todayOrders = Order::whereDate('tanggal', $today)->count();
        $todayRevenue = (int) Order::whereDate('tanggal', $today)->where('status_pembayaran', '>', 0)->sum('total_harga');
        $latestProducts = Produk::with('gambarproduk')->latest()->take(5)->get()->map(function ($p) {
            $img = $p->gambarproduk->first();
            return [
                'id' => $p->id,
                'nama' => $p->nama_produk,
                'harga' => (int) $p->harga,
                'stok' => (int) $p->stok,
                'image' => $img ? '/storage/' . $img->image : null,
            ];
        });

        $monthlySales = Order::where('status_pembayaran', '>', 0)
            ->where('tanggal', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(tanggal, '%Y-%m') as bulan, SUM(total_harga) as total")
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->pluck('total', 'bulan');

        $chartLabels = collect();
        $chartData = collect();
        for ($i = 11; $i >= 0; $i--) {
            $bulan = now()->subMonths($i)->format('Y-m');
            $chartLabels->push(now()->subMonths($i)->format('M Y'));
            $chartData->push((int) ($monthlySales[$bulan] ?? 0));
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalProduk' => $totalProduk,
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'todayOrders' => $todayOrders,
                'todayRevenue' => $todayRevenue,
            ],
            'latestProducts' => $latestProducts,
            'chartLabels' => $chartLabels,
            'chartData' => $chartData,
        ]);
    }
}
