<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('produks', function (Blueprint $table) {
            $table->id();
            $table->string('kode_produk', 15);
            $table->string('nama_produk', 30);
            $table->string('slug');
            $table->string('id_kategori', 11);
            $table->string('ukuran', 30);
            $table->string('harga', 30);
            $table->string('diskon', 11);
            $table->string('harga_diskon', 30);
            $table->string('stok', 11);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produks');
    }
};
