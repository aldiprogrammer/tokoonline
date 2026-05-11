<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SablonPrice extends Model
{
    protected $fillable = [
        'position',
        'label',
        'price',
    ];
}
