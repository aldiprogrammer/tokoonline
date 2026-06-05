<?php

namespace Database\Seeders;

use App\Models\Produk;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProdukSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $produks = [
            [
                'kode_produk' => 'BRG001',
                'nama_produk' => 'Kemeja Flanel Pria',
                'slug' => 'kemeja-flanel-pria',
                'id_kategori' => '1',
                'ukuran' => 'M, L, XL',
                'keterangan' => 'Kemeja flanel bahan katun premium, cocok untuk pria dewasa.',
                'harga' => '150000',
                'diskon' => '10',
                'harga_diskon' => '135000',
                'stok' => '50',
            ],
            [
                'kode_produk' => 'BRG002',
                'nama_produk' => 'Dress Wanita Modern',
                'slug' => 'dress-wanita-modern',
                'id_kategori' => '2',
                'ukuran' => 'S, M, L',
                'keterangan' => 'Dress wanita motif bunga dengan bahan sifon lembut.',
                'harga' => '200000',
                'diskon' => '15',
                'harga_diskon' => '170000',
                'stok' => '30',
            ],
            [
                'kode_produk' => 'BRG003',
                'nama_produk' => 'Kaos Anak Polos',
                'slug' => 'kaos-anak-polos',
                'id_kategori' => '3',
                'ukuran' => '2-3th, 4-5th, 6-7th',
                'keterangan' => 'Kaos katun 100% untuk anak-anak, nyaman dipakai sehari-hari.',
                'harga' => '50000',
                'diskon' => '0',
                'harga_diskon' => '0',
                'stok' => '100',
            ],
            [
                'kode_produk' => 'BRG004',
                'nama_produk' => 'Jam Tangan Pria',
                'slug' => 'jam-tangan-pria',
                'id_kategori' => '4',
                'ukuran' => 'All Size',
                'keterangan' => 'Jam tangan pria model klasik dengan tali kulit asli.',
                'harga' => '350000',
                'diskon' => '20',
                'harga_diskon' => '280000',
                'stok' => '25',
            ],
            [
                'kode_produk' => 'BRG005',
                'nama_produk' => 'Sepatu Sneakers Casual',
                'slug' => 'sepatu-sneakers-casual',
                'id_kategori' => '5',
                'ukuran' => '39, 40, 41, 42, 43',
                'keterangan' => 'Sepatu sneakers casual stylish untuk pria dan wanita.',
                'harga' => '450000',
                'diskon' => '25',
                'harga_diskon' => '337500',
                'stok' => '40',
            ],
            [
                'kode_produk' => 'BRG006',
                'nama_produk' => 'Tas Ransel Wanita',
                'slug' => 'tas-ransel-wanita',
                'id_kategori' => '2',
                'ukuran' => '30x40 cm',
                'keterangan' => 'Tas ransel wanita trendy dengan banyak kompartemen.',
                'harga' => '250000',
                'diskon' => '10',
                'harga_diskon' => '225000',
                'stok' => '20',
            ],
            [
                'kode_produk' => 'BRG007',
                'nama_produk' => 'Celana Jeans Pria',
                'slug' => 'celana-jeans-pria',
                'id_kategori' => '1',
                'ukuran' => '28, 29, 30, 31, 32',
                'keterangan' => 'Celana jeans pria bahan denim tebal dan nyaman.',
                'harga' => '180000',
                'diskon' => '5',
                'harga_diskon' => '171000',
                'stok' => '35',
            ],
            [
                'kode_produk' => 'BRG008',
                'nama_produk' => 'Topi Baseball',
                'slug' => 'topi-baseball',
                'id_kategori' => '4',
                'ukuran' => 'All Size',
                'keterangan' => 'Topi baseball casual dengan logo bordir eksklusif.',
                'harga' => '75000',
                'diskon' => '0',
                'harga_diskon' => '0',
                'stok' => '60',
            ],
            [
                'kode_produk' => 'BRG009',
                'nama_produk' => 'Baju Tidur Anak',
                'slug' => 'baju-tidur-anak',
                'id_kategori' => '3',
                'ukuran' => '2-3th, 4-5th',
                'keterangan' => 'Baju tidur anak motif kartun dengan bahan katun lembut.',
                'harga' => '65000',
                'diskon' => '10',
                'harga_diskon' => '58500',
                'stok' => '45',
            ],
            [
                'kode_produk' => 'BRG010',
                'nama_produk' => 'Sepatu Olahraga',
                'slug' => 'sepatu-olahraga',
                'id_kategori' => '5',
                'ukuran' => '39, 40, 41, 42',
                'keterangan' => 'Sepatu olahraga dengan sol empuk dan nyaman untuk lari.',
                'harga' => '500000',
                'diskon' => '30',
                'harga_diskon' => '350000',
                'stok' => '15',
            ],
        ];

        foreach ($produks as $produk) {
            Produk::create($produk);
        }
    }
}
