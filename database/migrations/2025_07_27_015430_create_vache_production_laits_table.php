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
        Schema::create('vache_production_laits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vache_id')->constrained()->onDelete('cascade');
            $table->decimal('production_lait', 5, 2)->comment('Production de lait en L');
            $table->timestamp('timestamp')->comment('Horodatage de la mesure');
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['vache_id', 'timestamp']);
            $table->index('production_lait');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vache_production_laits');
    }
};
