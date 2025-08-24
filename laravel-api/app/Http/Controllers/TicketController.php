<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    /**
     * Store a new ticket reservation
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'attendee_name' => 'required|string|max:255',
            'attendee_email' => 'required|email|max:255',
            'attendee_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:tab,cash',
            'tab_payment_id' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ticket = Ticket::create([
                'ticket_number' => 'TEMP-' . uniqid(),
                'event_name' => 'Waterfall Party Echo',
                'attendee_name' => $request->attendee_name,
                'attendee_email' => $request->attendee_email,
                'attendee_phone' => $request->attendee_phone,
                'price' => 900.00,
                'currency' => 'THB',
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cash' ? 'pending' : 'completed',
                'tab_payment_id' => $request->tab_payment_id,
                'qr_code' => '', // Will be generated after save
                'status' => 'active'
            ]);

            // Generate proper ticket number and QR code after saving
            $ticket->update([
                'ticket_number' => $ticket->generateTicketNumber(),
                'qr_code' => $ticket->generateQRCode()
            ]);

            return response()->json([
                'success' => true,
                'ticket' => [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'qr_code' => $ticket->qr_code,
                    'attendee_name' => $ticket->attendee_name,
                    'event_name' => $ticket->event_name,
                    'price' => $ticket->price,
                    'currency' => $ticket->currency,
                    'status' => $ticket->status,
                    'payment_status' => $ticket->payment_status
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ticket by ticket number
     */
    public function show(string $ticketNumber): JsonResponse
    {
        $ticket = Ticket::where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'ticket' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'qr_code' => $ticket->qr_code,
                'attendee_name' => $ticket->attendee_name,
                'attendee_email' => $ticket->attendee_email,
                'event_name' => $ticket->event_name,
                'price' => $ticket->price,
                'currency' => $ticket->currency,
                'status' => $ticket->status,
                'payment_status' => $ticket->payment_status,
                'created_at' => $ticket->created_at->toISOString()
            ]
        ]);
    }

    /**
     * Validate ticket by QR code
     */
    public function validate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'qr_code' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = Ticket::where('qr_code', $request->qr_code)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR code'
            ], 404);
        }

        if ($ticket->status === 'used') {
            return response()->json([
                'success' => false,
                'message' => 'Ticket already used'
            ], 400);
        }

        if ($ticket->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Ticket cancelled'
            ], 400);
        }

        // Mark ticket as used
        $ticket->update(['status' => 'used']);

        return response()->json([
            'success' => true,
            'message' => 'Ticket validated successfully',
            'ticket' => [
                'ticket_number' => $ticket->ticket_number,
                'attendee_name' => $ticket->attendee_name,
                'event_name' => $ticket->event_name,
                'validated_at' => now()->toISOString()
            ]
        ]);
    }
}