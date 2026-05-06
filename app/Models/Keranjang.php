<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Keranjang extends Model
{
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk');
    }
}
