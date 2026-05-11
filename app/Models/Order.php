<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'kode_order',
        'id_user',
        'nama_penerima',
        'whatsapp',
        'alamat_pengiriman',
        'destination_id',
        'destination_label',
        'kurir',
        'layanan_kurir',
        'estimasi',
        'subtotal',
        'ongkir',
        'total_harga',
        'midtrans_order_id',
        'midtrans_token',
        'midtrans_redirect_url',
        'status_pembayaran',
        'status_midtrans',
        'status_pengiriman',
        'no_resi',
        'tanggal',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
