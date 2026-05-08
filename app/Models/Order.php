<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'kode_order',
        'id_user',
        'total_harga',
        'status_pembayaran',
        'tanggal',
    ];
}
