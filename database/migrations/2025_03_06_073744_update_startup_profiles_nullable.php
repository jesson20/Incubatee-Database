<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('startup_profiles', function (Blueprint $table) {
            $table->date('date_registered_dti')->nullable()->change();
            $table->date('date_registered_bir')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('startup_profiles', function (Blueprint $table) {
            $table->date('date_registered_dti')->nullable(false)->change();
            $table->date('date_registered_bir')->nullable(false)->change();
        });
    }
};
