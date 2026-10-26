<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Edificio extends Model
{
    use HasFactory;

    protected $table = 'edificios';

    protected $fillable = [
        'nombre',
    ];

    /**
     * Un edificio tiene muchas aulas (Relación 1:N)
     */
    public function aulas()
    {
        return $this->hasMany(Aula::class, 'edificio_id', 'id');
    }
}
