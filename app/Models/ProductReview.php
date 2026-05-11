<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    protected $fillable = [
        'user_id',
        'order_id',
        'produk_id',
        'rating',
        'komentar',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
