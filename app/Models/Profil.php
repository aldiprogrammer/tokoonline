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
        return $this->hasMany(Alamat::class, 'id_profil');
    }

    public function alamatUtama()
    {
        return $this->hasOne(Alamat::class, 'id_profil')->where('alamat_utama', true);
    }
}
