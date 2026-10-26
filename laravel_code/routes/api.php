<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EdificioController;
use App\Http\Controllers\AulaController;
use App\Http\Controllers\SillaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::apiResource('edificios', EdificioController::class);
Route::apiResource('sillas', SillaController::class);
