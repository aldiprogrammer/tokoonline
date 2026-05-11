<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('produk_id');
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('komentar');
            $table->timestamps();

            $table->unique(['user_id', 'order_id', 'produk_id']);
            $table->index('produk_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
