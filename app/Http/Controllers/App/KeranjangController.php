<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Keranjang;
use Illuminate\Http\Request;

class KeranjangController extends Controller
{
    function index($iduser)
    {
        $kr = Keranjang::with('produk.gambar')->where('id_user', $iduser)->get();
        // $total = Keranjang::where('id_user', $iduser)->sum('total_harga');

        $total = $kr->sum(function ($item) {
            return $item->harga * $item->qty;
        });
        return response()->json(['data' => $kr, 'total' => $total]);
    }

    function tambahqty($id)
    {
        $kr = Keranjang::find($id);
        $kr->qty = $kr->qty + 1;
        $kr->update();
    }

    function kurangqty($id)
    {
        $kr = Keranjang::find($id);
        $qty = $kr->qty - 1;
        if ($qty == 0) {
            $kr->delete();
        } else {
            $kr->qty = $qty;
            $kr->update();
        }
    }

    function hapus($id)
    {
        $kr = Keranjang::find($id);
        $kr->delete();
    }
}
