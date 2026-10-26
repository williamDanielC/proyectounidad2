<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    use HasFactory;

    protected $table = 'aulas';

    protected $fillable = [
        'nombre',
        'capacidad',
        'wifi',
        'edificio_id',
    ];

    /**
     * Un aula pertenece a un edificio (Relación N:1)
     */
    public function edificio()
    {
        return $this->belongsTo(Edificio::class, 'edificio_id', 'id');
    }
}
