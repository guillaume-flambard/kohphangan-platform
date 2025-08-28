<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\OmisePaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
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
    // Public key for frontend
    Route::get('/public-key', [OmisePaymentController::class, 'getPublicKey']);
    
    // Payment processing
    Route::post('/charge', [OmisePaymentController::class, 'createCharge']);
    
    // Recipient management (for organizer payouts)
    Route::post('/recipients', [OmisePaymentController::class, 'createRecipient']);
    Route::get('/recipients/{recipientId}', [OmisePaymentController::class, 'getRecipient']);
    
    // Webhook endpoint (should be configured in Omise dashboard)
    Route::post('/webhook', [OmisePaymentController::class, 'webhook']);
});

// QR Payment Routes
Route::prefix('qr')->group(function () {
    Route::post('/generate-url', [App\Http\Controllers\QRPaymentController::class, 'generatePaymentURL']);
    Route::post('/generate-batch', [App\Http\Controllers\QRPaymentController::class, 'generateBatchQRCodes']);
    Route::post('/parse-url', [App\Http\Controllers\QRPaymentController::class, 'parsePaymentURL']);
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