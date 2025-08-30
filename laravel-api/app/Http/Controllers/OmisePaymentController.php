<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use OmiseCharge;
use OmiseRecipient;

class OmisePaymentController extends Controller
{
  private $omiseSecretKey;
  private $omisePublicKey;

  public function __construct()
  {
    $this->omiseSecretKey = config('omise.secret_key');
    $this->omisePublicKey = config('omise.public_key');

    // Configure Omise using constants
    if ($this->omiseSecretKey && $this->omisePublicKey) {
      if (!defined('OMISE_SECRET_KEY')) {
        define('OMISE_SECRET_KEY', $this->omiseSecretKey);
      }
      if (!defined('OMISE_PUBLIC_KEY')) {
        define('OMISE_PUBLIC_KEY', $this->omisePublicKey);
      }
      if (!defined('OMISE_API_VERSION')) {
        define('OMISE_API_VERSION', config('omise.api_version'));
      }
    }
  }

  /**
   * Get Omise public key for frontend
   */
  public function getPublicKey(): JsonResponse
  {
    return response()->json([
      'success' => true,
      'public_key' => $this->omisePublicKey
    ])->header('Access-Control-Allow-Origin', '*')
      ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  }

  /**
   * Create payment charge
   */
  public function createCharge(Request $request): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'token' => 'required|string',
      'amount' => 'required|integer|min:1',
      'quantity' => 'required|integer|min:1|max:10',
      'attendee_name' => 'required|string|max:255',
      'attendee_email' => 'required|email|max:255',
      'attendee_phone' => 'nullable|string|max:20',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      if (!class_exists('\OmiseCharge')) {
        return response()->json([
          'success' => false,
          'message' => 'Omise payment system not available'
        ], 500);
      }

      $amount = $request->amount;
      $quantity = $request->quantity;
      $totalAmount = $amount * $quantity;

      $charge = OmiseCharge::create([
        'amount' => $totalAmount,
        'currency' => 'THB',
        'description' => "Waterfall Festival Ticket(s) x{$quantity} for {$request->attendee_name}",
        'card' => $request->token,
        'metadata' => [
          'event_name' => 'Waterfall Festival Koh Phangan',
          'attendee_name' => $request->attendee_name,
          'attendee_email' => $request->attendee_email,
          'quantity' => $quantity,
        ]
      ]);

      // If the charge is immediately successful
      if ($charge['paid']) {
        $tickets = $this->createTicketsForCharge($request, $charge);
        Log::info('Omise payment successful', ['charge_id' => $charge['id'], 'amount' => $totalAmount, 'attendee' => $request->attendee_email, 'tickets_created' => count($tickets)]);
        return response()->json([
          'success' => true,
          'status' => 'successful',
          'charge_id' => $charge['id'],
          'amount_paid' => $charge['amount'],
          'tickets' => $tickets,
          'message' => 'Payment successful! Your tickets have been generated.'
        ], 201)->header('Access-Control-Allow-Origin', '*')->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
      }

      // If the charge is pending (e.g., PromptPay)
      if ($charge['status'] === 'pending') {
        $this->createTicketsForCharge($request, $charge, 'pending');
        Log::info('Omise payment pending', ['charge_id' => $charge['id'], 'amount' => $totalAmount, 'attendee' => $request->attendee_email]);
        return response()->json([
          'success' => true,
          'status' => 'pending',
          'charge_id' => $charge['id'],
          'message' => 'Payment is pending. Please wait for confirmation.'
        ], 202)->header('Access-Control-Allow-Origin', '*')->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
      }

      // If the charge failed immediately
      return response()->json([
        'success' => false,
        'status' => 'failed',
        'message' => 'Payment failed',
        'error' => $charge['failure_message'] ?? 'Unknown payment error'
      ], 400)->header('Access-Control-Allow-Origin', '*')->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

    } catch (Exception $e) {
      Log::error('Omise payment error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
      return response()->json([
        'success' => false,
        'message' => 'Payment processing failed',
        'error' => $e->getMessage()
      ], 500)->header('Access-Control-Allow-Origin', '*')->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    }
  }

  /**
   * Helper function to create tickets from a charge request.
   */
  private function createTicketsForCharge(Request $request, $charge, string $paymentStatus = 'completed'): array
  {
    $ticketsData = [];
    for ($i = 0; $i < $request->quantity; $i++) {
      $ticket = Ticket::create([
        'ticket_number' => 'TEMP-' . uniqid(),
        'event_name' => 'Waterfall Festival Koh Phangan',
        'attendee_name' => $request->attendee_name,
        'attendee_email' => $request->attendee_email,
        'attendee_phone' => $request->attendee_phone,
        'price' => ($charge['amount'] / 100) / $request->quantity,
        'currency' => 'THB',
        'payment_method' => 'omise',
        'payment_status' => $paymentStatus,
        'tab_payment_id' => $charge['id'],
        'qr_code' => '',
        'status' => $paymentStatus === 'completed' ? 'active' : 'pending'
      ]);

      if ($paymentStatus === 'completed') {
        $ticket->update([
          'ticket_number' => $ticket->generateTicketNumber(),
          'qr_code' => $ticket->generateQRCode()
        ]);
      }

      $ticketsData[] = [
        'id' => $ticket->id,
        'ticket_number' => $ticket->ticket_number,
        'attendee_name' => $ticket->attendee_name,
      ];
    }
    return $ticketsData;
  }

  /**
   * Add a new endpoint to check payment status
   */
  public function getChargeStatus(string $chargeId): JsonResponse
  {
    $ticket = Ticket::where('tab_payment_id', $chargeId)->first();

    if (!$ticket) {
      return response()->json(['success' => false, 'message' => 'Charge not found'], 404)->header('Access-Control-Allow-Origin', '*')->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    }

    return response()->json([
      'success' => true,
      'status' => $ticket->payment_status,
      'tickets' => $ticket->payment_status === 'completed' ? Ticket::where('tab_payment_id', $chargeId)->get() : []
    ])->header('Access-Control-Allow-Origin', '*')->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  }

  /**
   * Create recipient for party organizer payouts
   */
  public function createRecipient(Request $request): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'email' => 'required|email',
      'bank_account' => 'required|array',
      'bank_account.name' => 'required|string',
      'bank_account.number' => 'required|string|min:8',
      'bank_account.brand' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      if (!class_exists('\OmiseRecipient')) {
        return response()->json([
          'success' => false,
          'message' => 'Omise recipient system not available'
        ], 500);
      }

      $recipient = OmiseRecipient::create([
        'name' => $request->name,
        'email' => $request->email,
        'type' => 'individual',
        'bank_account' => [
          'brand' => $request->bank_account['brand'],
          'number' => $request->bank_account['number'],
          'name' => $request->bank_account['name'],
        ],
        'description' => 'Waterfall Festival organizer recipient for ' . $request->email,
      ]);

      Log::info('Omise recipient created', [
        'recipient_id' => $recipient['id'],
        'email' => $request->email
      ]);

      return response()->json([
        'success' => true,
        'recipient' => [
          'id' => $recipient['id'],
          'name' => $recipient['name'],
          'email' => $recipient['email'],
          'bank_account' => [
            'brand' => $recipient['bank_account']['brand'],
            'last_digits' => $recipient['bank_account']['last_digits']
          ],
          'verified' => $recipient['verified'],
          'active' => $recipient['active']
        ]
      ], 201);

    } catch (Exception $e) {
      Log::error('Omise recipient creation error', [
        'error' => $e->getMessage(),
        'email' => $request->email
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to create recipient',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get recipient details
   */
  public function getRecipient(string $recipientId): JsonResponse
  {
    try {
      if (!class_exists('\OmiseRecipient')) {
        return response()->json([
          'success' => false,
          'message' => 'Omise recipient system not available'
        ], 500);
      }

      $recipient = OmiseRecipient::retrieve($recipientId);

      return response()->json([
        'success' => true,
        'recipient' => $recipient
      ]);

    } catch (Exception $e) {
      Log::error('Error retrieving recipient', [
        'recipient_id' => $recipientId,
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve recipient',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Webhook handler for Omise events
   */
  public function webhook(Request $request): JsonResponse
  {
    $payload = $request->all();
    $event = $payload['key'] ?? null;

    Log::info('Omise webhook received', ['event' => $event, 'payload' => $payload]);
    
    // For security, you should verify the webhook signature in production
    // $signature = $request->header('X-Omise-Signature');
    // if (!$this->verifyWebhookSignature($signature, $request->getContent())) {
    //     Log::warning('Invalid webhook signature');
    //     return response()->json(['success' => false], 401);
    // }

    try {
      switch ($event) {
        case 'charge.complete':
          $this->handleChargeComplete($payload['data']);
          break;
        case 'charge.failed':
          $this->handleChargeFailed($payload['data']);
          break;
        case 'transfer.complete':
          $this->handleTransferComplete($payload['data']);
          break;
        default:
          Log::info('Unhandled webhook event', ['event' => $event]);
      }

      return response()->json(['success' => true], 200);

    } catch (Exception $e) {
      Log::error('Webhook processing error', [
        'error' => $e->getMessage(),
        'event' => $event
      ]);

      return response()->json(['success' => false], 500);
    }
  }

  private function handleChargeComplete($chargeData)
  {
    $chargeId = $chargeData['id'];

    $tickets = Ticket::where('tab_payment_id', $chargeId)->get();

    foreach ($tickets as $ticket) {
      $ticket->update([
        'payment_status' => 'completed',
        'status' => 'active',
        'ticket_number' => $ticket->generateTicketNumber(),
        'qr_code' => $ticket->generateQRCode()
      ]);
    }

    Log::info('Charge completed webhook processed', [
      'charge_id' => $chargeId,
      'tickets_updated' => $tickets->count()
    ]);
  }

  private function handleChargeFailed($chargeData): void
  {
    $chargeId = $chargeData['id'];

    $tickets = Ticket::where('tab_payment_id', $chargeId)->get();

    foreach ($tickets as $ticket) {
      $ticket->update([
        'payment_status' => 'failed',
        'status' => 'cancelled'
      ]);
    }

    Log::warning('Charge failed webhook processed', [
      'charge_id' => $chargeId,
      'tickets_cancelled' => $tickets->count()
    ]);
  }

  private function handleTransferComplete($transferData)
  {
    Log::info('Transfer completed webhook processed', [
      'transfer_id' => $transferData['id'],
      'amount' => $transferData['amount']
    ]);
  }
}

