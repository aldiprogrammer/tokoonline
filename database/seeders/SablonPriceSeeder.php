<?php

namespace Database\Seeders;

use App\Models\SablonPrice;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SablonPriceSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $positions = [
            ['position' => 'sleeve', 'label' => 'Lengan', 'price' => 15000],
            ['position' => 'left_chest', 'label' => 'Dada Kiri', 'price' => 20000],
            ['position' => 'center_chest', 'label' => 'Dada Tengah', 'price' => 25000],
            ['position' => 'full_front', 'label' => 'Full Depan', 'price' => 35000],
            ['position' => 'oversize_front', 'label' => 'Oversize Depan', 'price' => 45000],
        ];

        foreach ($positions as $pos) {
            SablonPrice::updateOrCreate(
                ['position' => $pos['position']],
                $pos
            );
        }
    }
}
