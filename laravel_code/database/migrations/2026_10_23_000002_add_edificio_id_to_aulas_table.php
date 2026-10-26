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
        Schema::table('aulas', function (Blueprint $table) {
            // Relación con la tabla edificios mediante llave foránea
            $table->foreignId('edificio_id')
                  ->nullable()
                  ->after('wifi')
                  ->constrained('edificios')
                  ->nullOnDelete(); // O onDelete('set null')
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aulas', function (Blueprint $table) {
            $table->dropForeign(['edificio_id']);
            $table->dropColumn('edificio_id');
        });
    }
};
