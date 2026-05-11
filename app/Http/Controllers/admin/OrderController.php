<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Order', [
            'orders' => Order::latest()->get(),
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
