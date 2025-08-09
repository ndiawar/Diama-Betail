<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Utiliser seeder optimisé selon l'environnement
        if (app()->environment('production')) {
            $this->call([
                ProductionSeeder::class,
            ]);
        } else {
            // Développement local - Historique complet
            $this->call([
                VachePositionsHistorySeeder::class,
            ]);
        }

        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
