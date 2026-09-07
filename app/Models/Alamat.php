<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alamat extends Model
{
    protected $fillable = [
        'id_profil',
        'id_user',
        'alamat_utama',
        'provinsi',
        'kabupaten',
        'kecamatan',
        'kelurahan',
        'alamat',
        'kode_pos',
        'rajaongkir_destination_id',
        'rajaongkir_destination_label',
    ];
}
