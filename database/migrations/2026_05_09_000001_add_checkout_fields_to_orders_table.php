<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('nama_penerima')->nullable()->after('id_user');
            $table->string('whatsapp')->nullable()->after('nama_penerima');
            $table->text('alamat_pengiriman')->nullable()->after('whatsapp');
            $table->string('destination_id')->nullable()->after('alamat_pengiriman');
            $table->string('destination_label')->nullable()->after('destination_id');
            $table->string('kurir')->nullable()->after('destination_label');
            $table->string('layanan_kurir')->nullable()->after('kurir');
            $table->string('estimasi')->nullable()->after('layanan_kurir');
            $table->unsignedInteger('subtotal')->default(0)->after('estimasi');
            $table->unsignedInteger('ongkir')->default(0)->after('subtotal');
            $table->string('midtrans_order_id')->nullable()->unique()->after('total_harga');
            $table->string('midtrans_token')->nullable()->after('midtrans_order_id');
            $table->string('midtrans_redirect_url')->nullable()->after('midtrans_token');
            $table->string('status_midtrans')->nullable()->after('status_pembayaran');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['midtrans_order_id']);
            $table->dropColumn([
                'nama_penerima',
                'whatsapp',
                'alamat_pengiriman',
                'destination_id',
                'destination_label',
                'kurir',
                'layanan_kurir',
                'estimasi',
                'subtotal',
                'ongkir',
                'midtrans_order_id',
                'midtrans_token',
                'midtrans_redirect_url',
                'status_midtrans',
            ]);
        });
    }
};
