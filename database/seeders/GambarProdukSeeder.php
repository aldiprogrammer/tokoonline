<?php

namespace Database\Seeders;

use App\Models\Gambarprodk;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GambarProdukSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $gambar = [];

        for ($i = 1; $i <= 10; $i++) {
            $gambar[] = ['id_produk' => (string) $i, 'image' => "https://placehold.co/600x600/EEE/31343C?text=Produk+{$i}+Depan", 'posisi' => 'depan'];
            $gambar[] = ['id_produk' => (string) $i, 'image' => "https://placehold.co/600x600/EEE/31343C?text=Produk+{$i}+Samping", 'posisi' => 'samping'];
            $gambar[] = ['id_produk' => (string) $i, 'image' => "https://placehold.co/600x600/EEE/31343C?text=Produk+{$i}+Belakang", 'posisi' => 'belakang'];
        }

        foreach ($gambar as $g) {
            Gambarprodk::create($g);
        }
    }
}
