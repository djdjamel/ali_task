<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTacheTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tache', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('description');
            $table->integer('matin')->default(1);
            $table->integer('level')->default(0);
            $table->integer('priorite')->default(0);
            $table->integer('frequence')->default(0);
            $table->integer('deja_affecte')->default(0);
            $table->integer('temps_estime')->default(0);
            $table->integer('unique')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tache');
    }
}
