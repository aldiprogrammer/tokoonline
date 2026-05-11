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
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('sablon_position', 50)->nullable()->after('image');
            $table->unsignedInteger('sablon_price')->nullable()->after('sablon_position');
            $table->string('sablon_image', 255)->nullable()->after('sablon_price');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['sablon_position', 'sablon_price', 'sablon_image']);
        });
    }
};
