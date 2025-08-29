<?php

use App\Http\Controllers\OmisePaymentController;
use App\Http\Controllers\QRPaymentController;
use App\Http\Controllers\TicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Ticket Management Routes
Route::prefix('tickets')->group(function () {
    Route::post('/', [TicketController::class, 'store']);
    Route::get('/{ticketNumber}', [TicketController::class, 'show']);
    Route::post('/validate', [TicketController::class, 'validate']);
});

// Omise Payment Routes
Route::prefix('omise')->group(function () {
    Route::get('/public-key', [OmisePaymentController::class, 'getPublicKey']);
    Route::post('/charge', [OmisePaymentController::class, 'createCharge']);
    Route::post('/recipients', [OmisePaymentController::class, 'createRecipient']);
    Route::get('/recipients/{recipientId}', [OmisePaymentController::class, 'getRecipient']);
    Route::post('/webhook', [OmisePaymentController::class, 'webhook']);
});

// QR Payment Routes
Route::prefix('qr')->group(function () {
    Route::post('/generate-url', [QRPaymentController::class, 'generatePaymentURL']);
    Route::post('/generate-batch', [QRPaymentController::class, 'generateBatchQRCodes']);
    Route::post('/parse-url', [QRPaymentController::class, 'parsePaymentURL']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'app' => config('app.name'),
        'version' => '1.0.0',
        'omise_configured' => !empty(env('OMISE_PUBLIC_KEY')) && !empty(env('OMISE_SECRET_KEY'))
    ]);
});