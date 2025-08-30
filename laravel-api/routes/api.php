<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\OmisePaymentController;
use App\Http\Controllers\EventScraperController;

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
        'omise_configured' => !empty(config('omise.public_key')) && !empty(config('omise.secret_key'))
    ]);
});

// Emergency database fix endpoint - SIMPLE APPROACH
Route::get('/fix-now', function () {
    try {
        // Just recreate the table with correct constraint
        DB::statement("DROP TABLE IF EXISTS tickets");
        
        DB::statement("
            CREATE TABLE tickets (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                ticket_number VARCHAR(255) UNIQUE NOT NULL,
                event_name VARCHAR(255) DEFAULT 'Waterfall Party Echo' NOT NULL,
                attendee_name VARCHAR(255) NOT NULL,
                attendee_email VARCHAR(255) NOT NULL,
                attendee_phone VARCHAR(20),
                price DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'THB' NOT NULL,
                payment_method ENUM('cash', 'omise') DEFAULT 'omise' NOT NULL,
                payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' NOT NULL,
                tab_payment_id VARCHAR(255),
                qr_code TEXT NOT NULL,
                status ENUM('active', 'used', 'cancelled') DEFAULT 'active' NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        return response()->json([
            'success' => true,
            'message' => 'FIXED! Try payment now!'
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// Event Scraper Routes
Route::prefix('events')->group(function () {
    Route::get('/', [EventScraperController::class, 'getEvents']);
    Route::post('/scrape', [EventScraperController::class, 'runScraper']);
    Route::get('/stats', [EventScraperController::class, 'getEventStats']);
});