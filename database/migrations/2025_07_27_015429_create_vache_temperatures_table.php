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
        Schema::create('vache_temperatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vache_id')->constrained()->onDelete('cascade');
            $table->decimal('temperature', 4, 1)->comment('Température corporelle en °C');
            $table->enum('statut_sante', ['bonne', 'attention', 'malade'])->default('bonne');
            $table->timestamp('timestamp')->comment('Horodatage de la mesure');
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['vache_id', 'timestamp']);
            $table->index('temperature');
            $table->index('statut_sante');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vache_temperatures');
    }
};
