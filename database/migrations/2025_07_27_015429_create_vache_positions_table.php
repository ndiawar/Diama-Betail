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
        Schema::create('vache_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vache_id')->constrained()->onDelete('cascade');
            $table->decimal('latitude', 10, 8)->comment('Latitude GPS');
            $table->decimal('longitude', 11, 8)->comment('Longitude GPS');
            $table->decimal('altitude', 8, 2)->nullable()->comment('Altitude en mètres');
            $table->timestamp('timestamp')->comment('Horodatage de la position');
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['vache_id', 'timestamp']);
            $table->index('timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vache_positions');
    }
};
