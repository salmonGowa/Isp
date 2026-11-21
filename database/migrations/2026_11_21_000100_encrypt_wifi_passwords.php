<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ciphertext is far longer than the 12-char key, so widen the column first.
        Schema::table('wifi_networks', function (Blueprint $table) {
            $table->text('wifi_password')->change();
        });

        DB::table('wifi_networks')->orderBy('id')->each(function ($row) {
            try {
                Crypt::decryptString($row->wifi_password);

                return; // already encrypted
            } catch (DecryptException) {
                DB::table('wifi_networks')->where('id', $row->id)
                    ->update(['wifi_password' => Crypt::encryptString($row->wifi_password)]);
            }
        });
    }

    public function down(): void
    {
        DB::table('wifi_networks')->orderBy('id')->each(function ($row) {
            try {
                DB::table('wifi_networks')->where('id', $row->id)
                    ->update(['wifi_password' => Crypt::decryptString($row->wifi_password)]);
            } catch (DecryptException) {
                // leave as-is
            }
        });

        Schema::table('wifi_networks', function (Blueprint $table) {
            $table->string('wifi_password')->change();
        });
    }
};
