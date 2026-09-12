<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Gambarprodk;
use App\Models\Kategori;
use App\Models\Produk;
use App\Models\Ratio;
use App\Services\WatermarkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProdukCotroller extends Controller
{
    function index()
    {
        $kategori = Kategori::all();
        $produk = Produk::with(['kategoriproduk', 'gambarproduk'])->get();
        return Inertia::render('Admin/Produk', compact('produk', 'kategori'));
    }

    function show()
    {
        $kode = 'PRD-' . rand(0, 100000);
        $kategori = Kategori::all();
        $ratios = Ratio::all();
        return Inertia::render('Admin/Tambahproduk', compact('kode', 'kategori', 'ratios'));
    }

    function store(Request $request)
    {
        $request->validate([
            'nama' => 'required',
            'kategori_id' => 'required',
            'ukuran' => 'required|array',
            'ukuran.*' => 'required|string',
            'keterangan' => 'required',
            'harga' => 'required',
            'diskon' => 'required',
            'stok' => 'required',
            'image_depan' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'image_samping' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'image_belakang' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $pr = new Produk();
        $slug = Str::slug($request->nama);
        $pr->kode_produk = $request->kode;
        $pr->nama_produk = $request->nama;
        $pr->id_kategori = $request->kategori_id;
        $pr->ukuran = implode(',', $request->ukuran);
        $pr->ratio = $request->ratio;
        $pr->keterangan = $request->keterangan;
        $harga = (int) $request->harga;
        $diskon = (int) $request->diskon;
        $pr->harga = $harga;
        $pr->diskon = $diskon;
        $pr->harga_diskon = $diskon > 0 ? $harga - (int) ($harga * $diskon / 100) : $harga;
        $pr->slug = $slug;
        $pr->stok = $request->stok;
        $pr->save();

        $positions = [
            'image_depan' => 'depan',
            'image_samping' => 'samping',
            'image_belakang' => 'belakang',
        ];

        foreach ($positions as $field => $posisi) {
            if ($request->hasFile($field)) {
                $path = WatermarkService::apply($request->file($field), 'public', 'produk');

                $img = new Gambarprodk();
                $img->id_produk = $pr->id;
                $img->image = $path;
                $img->posisi = $posisi;
                $img->save();
            }
        }

        return redirect()->route('admin.produk')->with('success', 'Data berhasil ditambah');
    }

    function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required',
            'kategori_id' => 'required',
            'ukuran' => 'required|array',
            'ukuran.*' => 'required|string',
            'keterangan' => 'required',
            'harga' => 'required',
            'diskon' => 'required',
            'stok' => 'required',
            'image_depan' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'image_samping' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'image_belakang' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $pr = Produk::findOrFail($id);
        $pr->nama_produk = $request->nama;
        $pr->id_kategori = $request->kategori_id;
        $pr->ukuran = implode(',', $request->ukuran);
        $pr->ratio = $request->ratio ?? $pr->ratio;
        $pr->keterangan = $request->keterangan;
        $harga = (int) $request->harga;
        $diskon = (int) $request->diskon;
        $pr->harga = $harga;
        $pr->diskon = $diskon;
        $pr->harga_diskon = $diskon > 0 ? $harga - (int) ($harga * $diskon / 100) : $harga;
        $pr->slug = Str::slug($request->nama);
        $pr->stok = $request->stok;
        $pr->save();

        $positions = [
            'image_depan' => 'depan',
            'image_samping' => 'samping',
            'image_belakang' => 'belakang',
        ];

        foreach ($positions as $field => $posisi) {
            if ($request->hasFile($field)) {
                $existing = Gambarprodk::where('id_produk', $pr->id)->where('posisi', $posisi)->first();
                if ($existing) {
                    Storage::disk('public')->delete($existing->image);
                    $existing->delete();
                }

                $path = WatermarkService::apply($request->file($field), 'public', 'produk');

                $img = new Gambarprodk();
                $img->id_produk = $pr->id;
                $img->image = $path;
                $img->posisi = $posisi;
                $img->save();
            }
        }

        return redirect()->back()->with('success', 'Data berhasil diubah');
    }

    function delete($id)
    {
        $pr = Produk::findOrFail($id);
        $gambarproduk = Gambarprodk::where('id_produk', $pr->id)->get();

        foreach ($gambarproduk as $gambar) {
            Storage::disk('public')->delete($gambar->image);
            $gambar->delete();
        }

        $pr->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}
