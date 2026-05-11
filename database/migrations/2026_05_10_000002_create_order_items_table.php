<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('produk_id');
            $table->string('nama_produk');
            $table->string('ukuran', 20)->nullable();
            $table->unsignedInteger('harga');
            $table->unsignedInteger('qty');
            $table->unsignedInteger('total_harga');
            $table->string('image')->nullable();
            $table->timestamps();

            $table->index('produk_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
