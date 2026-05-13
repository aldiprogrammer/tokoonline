<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = User::latest()->get()->map(function ($user) {
            $orders = Order::where('id_user', $user->id);
            $totalOrders = (clone $orders)->count();
            $totalSpent = (int) (clone $orders)->where('status_pembayaran', '>', 0)->sum('total_harga');
            $lastOrder = (clone $orders)->latest()->first();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'google_id' => $user->google_id,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'total_orders' => $totalOrders,
                'total_spent' => $totalSpent,
                'last_order_date' => $lastOrder?->tanggal,
            ];
        });

        return Inertia::render('Admin/Customer', [
            'customers' => $customers,
        ]);
    }
}
