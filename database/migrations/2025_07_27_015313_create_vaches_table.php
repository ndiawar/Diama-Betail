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
        Schema::create('vaches', function (Blueprint $table) {
            $table->id();
            
            // Informations d'identification
            $table->string('id_rfid')->unique()->comment('ID RFID unique de la vache');
            $table->string('nom')->comment('Nom de la vache');
            $table->string('race')->nullable()->comment('Race de la vache');
            $table->enum('sexe', ['Mâle', 'Femelle'])->default('Femelle');
            $table->integer('age')->nullable()->comment('Âge en mois');
            
            // Données physiques
            $table->decimal('poids', 6, 2)->nullable()->comment('Poids en kg');
            $table->decimal('temperature', 4, 1)->nullable()->comment('Température corporelle en °C');
            $table->decimal('production_lait', 5, 2)->nullable()->comment('Production de lait en L/jour');
            
            // Statut de santé
            $table->enum('statut_sante', ['bonne', 'attention', 'malade'])->default('bonne');
            
            // Informations de reproduction
            $table->date('dernier_vaccin')->nullable()->comment('Date du dernier vaccin');
            $table->date('prochaine_vaccination')->nullable()->comment('Date de la prochaine vaccination');
            $table->date('date_mise_bas')->nullable()->comment('Date de la dernière mise bas');
            $table->integer('nb_portees')->default(0)->comment('Nombre de portées');
            
            // Données GPS
            $table->decimal('latitude', 10, 8)->nullable()->comment('Latitude GPS');
            $table->decimal('longitude', 11, 8)->nullable()->comment('Longitude GPS');
            $table->decimal('altitude', 8, 2)->nullable()->comment('Altitude en mètres');
            $table->boolean('gps_actif')->default(true)->comment('Statut du GPS');
            
            // Timestamps de suivi
            $table->timestamp('derniere_position_at')->nullable()->comment('Dernière mise à jour de position');
            $table->timestamp('derniere_mise_a_jour_at')->nullable()->comment('Dernière mise à jour générale');
            
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index('id_rfid');
            $table->index('statut_sante');
            $table->index('gps_actif');
            $table->index('derniere_mise_a_jour_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaches');
    }
};
