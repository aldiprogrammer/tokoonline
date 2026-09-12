<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'id_kategori',
        'ukuran',
        'ratio',
        'keterangan',
        'harga',
        'diskon',
        'harga_diskon',
        'slug',
        'stok',
    ];
    // protected static function booted()
    // {
    //     static::creating(function ($product) {
    //         $product->slug = static::generateSlug($product->nama_produk);
    //     });

    //     static::updating(function ($product) {
    //         $product->slug = static::generateSlug($product->nama_produk);
    //     });
    // }

    public function kategoriproduk()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori');
    }

    public function gambarproduk()
    {
        return $this->hasMany(Gambarprodk::class, 'id_produk');
    }

    public function gambar()
    {
        return $this->hasMany(Gambarprodk::class, 'id_produk');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class, 'produk_id');
    }
}
