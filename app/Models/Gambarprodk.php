<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gambarprodk extends Model
{
    protected $fillable = [
        'id_produk',
        'image',
        'posisi',
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk');
    }
}
