<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBusinessDocumentsTable extends Migration
{
    public function up()
    {
        Schema::create('business_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('startup_profile_id');
            $table->string('dti_registration')->nullable();
            $table->string('bir_registration')->nullable();
            $table->string('sec_registration')->nullable();
            $table->timestamps();

            $table->foreign('startup_profile_id')
                ->references('id')
                ->on('startup_profiles')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('business_documents');
    }
}
