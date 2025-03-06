<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('startup_profiles', function (Blueprint $table) {
            $table->id(); // Auto-incrementing ID (Primary Key)
            $table->string('startup_name');
            $table->string('industry');
            $table->integer('number_of_members');
            $table->string('leader'); // New Column
            $table->date('date_registered_dti')->nullable();
            $table->date('date_registered_bir')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('startup_profiles');
    }
};
