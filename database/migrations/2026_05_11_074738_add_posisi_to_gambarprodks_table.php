<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gambarprodks', function (Blueprint $table) {
            $table->string('posisi', 20)->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('gambarprodks', function (Blueprint $table) {
            $table->dropColumn('posisi');
        });
    }
};
