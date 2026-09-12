<?php

namespace App\Http\Middleware;

use App\Models\Pengguna;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPenggunaSession
{
    protected array $routeMenuMap = [
        'admin.dashboard' => 'dashboard',
        'admin.order.hari-ini' => 'order-hari-ini',
        'admin.order' => 'order',
        'admin.order.status-pengiriman' => 'order',
        'admin.order.resi' => 'order',
        'admin.produk' => 'produk',
        'admin.tambahproduk' => 'produk',
        'store.admin.tambahproduk' => 'produk',
        'update.admin.produk' => 'produk',
        'delete.admin.produk' => 'produk',
        'admin.customer' => 'customer',
        'admin.laporan' => 'laporan',
        'admin.laporan.pdf' => 'laporan',
        'admin.kategori' => 'kategori',
        'store.admin.kategori' => 'kategori',
        'update.admin.kategori' => 'kategori',
        'delete.admin.kategori' => 'kategori',
        'admin.ratio' => 'ratio',
        'store.admin.ratio' => 'ratio',
        'update.admin.ratio' => 'ratio',
        'delete.admin.ratio' => 'ratio',
        'admin.role' => 'role',
        'store.admin.role' => 'role',
        'update.admin.role' => 'role',
        'delete.admin.role' => 'role',
        'admin.pengguna' => 'pengguna',
        'store.admin.pengguna' => 'pengguna',
        'update.admin.pengguna' => 'pengguna',
        'delete.admin.pengguna' => 'pengguna',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->session()->has('pengguna')) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu');
        }

        $hakAkses = $request->session()->get('pengguna')['hak_akses'] ?? [];

        if (!empty($hakAkses)) {
            $routeName = $request->route()?->getName();
            $menuKey = $this->routeMenuMap[$routeName] ?? null;

            if ($menuKey && !in_array($menuKey, $hakAkses)) {
                abort(403, 'Anda tidak memiliki hak akses untuk menu ini');
            }
        }

        return $next($request);
    }
}