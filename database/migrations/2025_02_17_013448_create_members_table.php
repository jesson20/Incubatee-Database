<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMembersTable extends Migration
{
    public function up()
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('course');
            $table->string('role');
            $table->unsignedBigInteger('startup_profile_id');
            $table->timestamps();

            // Foreign key constraint to link the member to a startup profile
            $table->foreign('startup_profile_id')
                ->references('id')
                ->on('startup_profiles')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('members');
    }
}
