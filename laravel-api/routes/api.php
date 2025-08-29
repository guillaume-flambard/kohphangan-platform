<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
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
        'omise_configured' => !empty(config('omise.public_key')) && !empty(config('omise.secret_key'))
    ]);
});

// Emergency database fix endpoint
Route::post('/emergency-db-fix', function () {
    try {
        // Direct SQLite table recreation to fix constraint
        DB::beginTransaction();
        
        // Get existing tickets (only cash ones we want to keep)
        $existingTickets = DB::select("SELECT * FROM tickets WHERE payment_method = 'cash'");
        
        // Create new table with correct constraints
        DB::statement("
            CREATE TABLE tickets_temp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_number VARCHAR(255) UNIQUE NOT NULL,
                event_name VARCHAR(255) DEFAULT 'Waterfall Party Echo' NOT NULL,
                attendee_name VARCHAR(255) NOT NULL,
                attendee_email VARCHAR(255) NOT NULL,
                attendee_phone VARCHAR(255),
                price DECIMAL(8,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'THB' NOT NULL,
                payment_method VARCHAR(255) CHECK (payment_method IN ('cash', 'omise')) DEFAULT 'omise' NOT NULL,
                payment_status VARCHAR(255) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending' NOT NULL,
                tab_payment_id VARCHAR(255),
                qr_code TEXT NOT NULL DEFAULT '',
                status VARCHAR(255) CHECK (status IN ('active', 'used', 'cancelled')) DEFAULT 'active' NOT NULL,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL
            )
        ");
        
        // Copy existing cash tickets
        foreach ($existingTickets as $ticket) {
            DB::table('tickets_temp')->insert((array) $ticket);
        }
        
        // Drop old table and rename
        DB::statement("DROP TABLE tickets");
        DB::statement("ALTER TABLE tickets_temp RENAME TO tickets");
        
        // Create indexes
        DB::statement("CREATE INDEX idx_tickets_attendee_email ON tickets(attendee_email)");
        DB::statement("CREATE INDEX idx_tickets_payment_status ON tickets(payment_status)");
        DB::statement("CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number)");
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'message' => 'Database constraint fixed successfully',
            'preserved_tickets' => count($existingTickets)
        ]);
    } catch (Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Database fix failed',
            'error' => $e->getMessage()
        ], 500);
    }
});