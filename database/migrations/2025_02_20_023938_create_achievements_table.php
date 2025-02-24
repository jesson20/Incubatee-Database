<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAchievementsTable extends Migration
{
    public function up()
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('competition_name');
            $table->string('organized_by');
            $table->decimal('prize_amount', 10, 2)->unsigned();
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
        Schema::dropIfExists('achievements');
    }
}
