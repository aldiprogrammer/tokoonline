<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $fillable = [
        'kode_order',
        'kode_invoice',
        'motode_pembayaran',
        'status',
    ];
}
