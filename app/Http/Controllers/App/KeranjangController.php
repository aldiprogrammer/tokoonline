<?php

namespace App\Http\Controllers\app;

use App\Http\Controllers\Controller;
use App\Models\Keranjang;
use Illuminate\Http\Request;

class KeranjangController extends Controller
{
    function index($iduser)
    {
        $kr = Keranjang::with('produk.gambar')->where('id_user', $iduser)->get();
        return response()->json($kr);
    }
}
