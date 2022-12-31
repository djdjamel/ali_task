<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
  
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TacheController;
use App\Http\Controllers\API\TacheOpController;
  
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
  
Route::post('login', [AuthController::class, 'signin']);
Route::post('register', [AuthController::class, 'signup']);
     
/*Route::middleware('auth:sanctum')->group( function () {
    Route::resource('taches', TacheController::class);
});*/


Route::middleware('auth:sanctum')->group( function () {
    Route::resource('taches', TacheController::class);
    Route::get('get_users', [TacheOpController::class, 'get_users']);
    Route::get('get_todays_program_for_user', [TacheOpController::class, 'get_todays_program_for_user']);

    Route::middleware(['IsAdmin'])->group(function () {
        Route::post('program', [TacheOpController::class, 'get_program']);
        Route::get('get_todays_program', [TacheOpController::class, 'get_todays_program']);       
        Route::post('save_program', [TacheOpController::class, 'save_program']); 
    });
});

