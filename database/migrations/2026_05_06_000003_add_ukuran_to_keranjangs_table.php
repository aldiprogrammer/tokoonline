<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('keranjangs', 'ukuran')) {
            Schema::table('keranjangs', function (Blueprint $table) {
                $table->string('ukuran', 20)->nullable()->after('id_produk');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('keranjangs', 'ukuran')) {
            Schema::table('keranjangs', function (Blueprint $table) {
                $table->dropColumn('ukuran');
            });
        }
    }
};
