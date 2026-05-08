<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profil extends Model
{
    protected $fillable = [
        'id_user',
        'nama',
        'whatsapp',
        'point',
    ];

    public function alamat()
    {
        return $this->hasOne(Alamat::class, 'id_profil');
    }
}
