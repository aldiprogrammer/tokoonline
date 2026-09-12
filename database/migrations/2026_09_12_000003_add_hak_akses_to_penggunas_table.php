<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('penggunas', 'hak_akses')) {
            Schema::table('penggunas', function (Blueprint $table) {
                $table->json('hak_akses')->nullable()->after('id_role');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('penggunas', 'hak_akses')) {
            Schema::table('penggunas', function (Blueprint $table) {
                $table->dropColumn('hak_akses');
            });
        }
    }
};