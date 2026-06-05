<?php

namespace Database\Seeders;

use App\Models\Kategori;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $kategoris = [
            ['kategori' => 'Pria'],
            ['kategori' => 'Wanita'],
            ['kategori' => 'Anak-anak'],
            ['kategori' => 'Aksesoris'],
            ['kategori' => 'Sepatu'],
        ];

        foreach ($kategoris as $kategori) {
            Kategori::create($kategori);
        }
    }
}
