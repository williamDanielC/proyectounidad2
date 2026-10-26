<?php

namespace App\Http\Controllers;

use App\Models\Edificio;
use Illuminate\Http\Request;

class EdificioController extends Controller
{
    /**
     * Listar todos los edificios (GET /api/edificios)
     */
    public function index()
    {
        $edificios = Edificio::with('aulas')->get();
        return response()->json($edificios, 200);
    }

    /**
     * Crear un nuevo edificio (POST /api/edificios)
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        $edificio = Edificio::create([
            'nombre' => $request->input('nombre'),
        ]);

        return response()->json($edificio, 201);
    }

    /**
     * Mostrar un edificio específico con sus aulas (GET /api/edificios/{id})
     */
    public function show($id)
    {
        $edificio = Edificio::with('aulas')->find($id);

        if (!$edificio) {
            return response()->json(['error' => 'Edificio no encontrado'], 404);
        }

        return response()->json($edificio, 200);
    }

    /**
     * Actualizar un edificio existente (PUT /api/edificios/{id})
     */
    public function update(Request $request, $id)
    {
        $edificio = Edificio::find($id);

        if (!$edificio) {
            return response()->json(['error' => 'Edificio no encontrado'], 404);
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        $edificio->nombre = $request->input('nombre');
        $edificio->save();

        return response()->json($edificio, 200);
    }

    /**
     * Eliminar un edificio (DELETE /api/edificios/{id})
     */
    public function destroy($id)
    {
        $edificio = Edificio::find($id);

        if (!$edificio) {
            return response()->json(['error' => 'Edificio no encontrado'], 404);
        }

        $edificio->delete();

        return response()->json([
            'mensaje' => "Edificio con ID {$id} eliminado exitosamente"
        ], 200);
    }
}
