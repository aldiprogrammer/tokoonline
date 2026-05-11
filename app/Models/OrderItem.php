<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'produk_id',
        'nama_produk',
        'ukuran',
        'harga',
        'qty',
        'total_harga',
        'image',
        'sablon_position',
        'sablon_price',
        'sablon_image',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
