<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alamats', function (Blueprint $table) {
            $table->string('rajaongkir_destination_id', 30)->nullable()->after('kode_pos');
            $table->string('rajaongkir_destination_label')->nullable()->after('rajaongkir_destination_id');
        });
    }

    public function down(): void
    {
        Schema::table('alamats', function (Blueprint $table) {
            $table->dropColumn([
                'rajaongkir_destination_id',
                'rajaongkir_destination_label',
            ]);
        });
    }
};
