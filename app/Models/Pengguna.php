<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengguna extends Model
{
    protected $casts = [
        'hak_akses' => 'array',
    ];

    public static function menus(): array
    {
        return [
            'dashboard' => 'Dashboard',
            'order-hari-ini' => 'Order Hari Ini',
            'order' => 'Data Order',
            'produk' => 'Produk',
            'customer' => 'Customer',
            'laporan' => 'Laporan',
            'kategori' => 'Kategori',
            'ratio' => 'Ratio',
            'role' => 'Role',
            'pengguna' => 'Pengguna',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role');
    }
}
