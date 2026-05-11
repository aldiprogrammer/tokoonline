<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alamat extends Model
{
    protected $fillable = [
        'id_profil',
        'id_user',
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
