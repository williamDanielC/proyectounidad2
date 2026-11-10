<?php

namespace App\Http\Controllers;

use App\Models\Edificio;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EdificioController extends Controller
{
    /**
     * Listar todos los edificios con sus aulas.
     * GET /api/edificios
     */
    public function index()
    {
        $edificios = Edificio::with('aulas')->get();

        return response()->json([
            'mensaje' => 'Lista de edificios obtenida exitosamente',
            'data' => $edificios
        ], 200);
    }

    /**
     * Crear un nuevo edificio.
     * POST /api/edificios
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:255',
                'unique:edificios,nombre'
            ],
        ]);

        $edificio = Edificio::create([
            'nombre' => $validated['nombre'],
        ]);

        return response()->json([
            'mensaje' => 'Edificio registrado exitosamente',
            'data' => $edificio
        ], 201);
    }

    /**
     * Mostrar un edificio específico con sus aulas.
     * GET /api/edificios/{id}
     */
    public function show($id)
    {
        $edificio = Edificio::with('aulas')->find($id);

        if (!$edificio) {
            return response()->json([
                'error' => 'Edificio no encontrado'
            ], 404);
        }

        return response()->json([
            'mensaje' => 'Edificio obtenido exitosamente',
            'data' => $edificio
        ], 200);
    }

    /**
     * Actualizar un edificio existente.
     * PUT /api/edificios/{id}
     */
    public function update(Request $request, $id)
    {
        $edificio = Edificio::find($id);

        if (!$edificio) {
            return response()->json([
                'error' => 'Edificio no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('edificios', 'nombre')->ignore($edificio->id)
            ],
        ]);

        $edificio->update([
            'nombre' => $validated['nombre'],
        ]);

        return response()->json([
            'mensaje' => 'Edificio actualizado exitosamente',
            'data' => $edificio
        ], 200);
    }

    /**
     * Eliminar un edificio.
     * DELETE /api/edificios/{id}
     */
    public function destroy($id)
    {
        $edificio = Edificio::find($id);

        if (!$edificio) {
            return response()->json([
                'error' => 'Edificio no encontrado'
            ], 404);
        }

        $edificio->delete();

        return response()->json([
            'mensaje' => "Edificio con ID {$id} eliminado exitosamente"
        ], 200);
    }
}
