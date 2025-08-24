<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;

Route::get('/', function () {
    return response()->json([
        'message' => 'Waterfall Party Echo API',
        'version' => '1.0',
        'status' => 'OK',
        'timestamp' => now()->toISOString(),
        'endpoints' => [
            'POST /api/tickets' => 'Create new ticket',
            'GET /api/tickets/{number}' => 'Get ticket by number', 
            'POST /api/tickets/validate' => 'Validate ticket QR code'
        ]
    ]);
});

// API Routes
Route::prefix('api')->group(function () {
    // Test endpoint without database
    Route::get('/test', function () {
        return response()->json([
            'success' => true,
            'message' => 'API is working!',
            'timestamp' => now()->toISOString()
        ]);
    });
    
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticketNumber}', [TicketController::class, 'show']);
    Route::post('/tickets/validate', [TicketController::class, 'validate']);
});
