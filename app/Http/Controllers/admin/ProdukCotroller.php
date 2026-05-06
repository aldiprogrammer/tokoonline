<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Gambarprodk;
use App\Models\Kategori;
use App\Models\Produk;
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
        return Inertia::render('Admin/Tambahproduk', compact('kode', 'kategori'));
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
            'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $pr = new Produk();
        $slug = Str::slug($request->nama);
        $pr->kode_produk = $request->kode;
        $pr->nama_produk = $request->nama;
        $pr->id_kategori = $request->kategori_id;
        $pr->ukuran = implode(',', $request->ukuran);
        $pr->keterangan = $request->keterangan;
        $pr->harga = $request->harga;
        $pr->diskon = $request->diskon;
        $pr->harga_diskon = 000;
        $pr->slug = $slug;

        $pr->stok = $request->stok;
        $pr->save();

        $images = $request->file('images', [$request->file('image')]);

        foreach ($images as $image) {
            $path = $image->store('produk', 'public');

            $img = new Gambarprodk();
            $img->id_produk = $pr->id;
            $img->image = $path;
            $img->save();
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
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $pr = Produk::findOrFail($id);
        $pr->nama_produk = $request->nama;
        $pr->id_kategori = $request->kategori_id;
        $pr->ukuran = implode(',', $request->ukuran);
        $pr->keterangan = $request->keterangan;
        $pr->harga = $request->harga;
        $pr->diskon = $request->diskon;
        $pr->slug = Str::slug($request->nama);
        $pr->stok = $request->stok;
        $pr->save();

        if ($request->hasFile('images')) {
            $gambarproduk = Gambarprodk::where('id_produk', $pr->id)->get();

            foreach ($gambarproduk as $gambar) {
                Storage::disk('public')->delete($gambar->image);
                $gambar->delete();
            }

            foreach ($request->file('images') as $image) {
                $path = $image->store('produk', 'public');

                $img = new Gambarprodk();
                $img->id_produk = $pr->id;
                $img->image = $path;
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
