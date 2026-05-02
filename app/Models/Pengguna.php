<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengguna extends Model
{
    //

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role');
    }
}
