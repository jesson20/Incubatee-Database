<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('startup_profile_id');
            $table->enum('record_type', ['income', 'expense']);
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->timestamps();

            $table->foreign('startup_profile_id')
                ->references('id')
                ->on('startup_profiles')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financials');
    }
};
