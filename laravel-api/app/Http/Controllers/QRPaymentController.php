<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class QRPaymentController extends Controller
{
    /**
     * Generate QR code payment URL for an event
     */
    public function generatePaymentURL(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'date' => 'required|string|max:100',
            'time' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'image' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Build the payment URL with parameters
            $baseUrl = config('app.frontend_url', 'http://localhost:3000');
            $paymentPath = '/qr-payment';
            
            $params = [
                'name' => urlencode($request->name),
                'date' => urlencode($request->date),
                'time' => urlencode($request->time),
                'location' => urlencode($request->location),
                'price' => $request->price,
                'description' => urlencode($request->description ?? 'Amazing event experience'),
                'image' => urlencode($request->image ?? '/waterfall-party.jpeg'),
            ];

            $queryString = http_build_query($params);
            $paymentUrl = $baseUrl . $paymentPath . '?' . $queryString;

            // Generate QR code using a simple SVG QR code generator
            $qrCodeSvg = $this->generateSimpleQRCode($paymentUrl);

            Log::info('QR Payment URL generated', [
                'event_name' => $request->name,
                'price' => $request->price,
                'url_length' => strlen($paymentUrl)
            ]);

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'qr_code_svg' => $qrCodeSvg,
                'event_details' => [
                    'name' => $request->name,
                    'date' => $request->date,
                    'time' => $request->time,
                    'location' => $request->location,
                    'price' => $request->price,
                    'description' => $request->description,
                    'image' => $request->image,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('QR Payment URL generation error', [
                'error' => $e->getMessage(),
                'event_name' => $request->name ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payment URL',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a simple QR code SVG (placeholder - in production use proper QR library)
     */
    private function generateSimpleQRCode(string $url): string
    {
        // This is a simplified placeholder. For production, use:
        // composer require endroid/qr-code
        // or another proper QR code library
        
        $urlHash = hash('crc32', $url);
        $size = 200;
        
        $svg = '<?xml version="1.0" encoding="UTF-8"?>';
        $svg .= '<svg width="' . $size . '" height="' . $size . '" xmlns="http://www.w3.org/2000/svg">';
        $svg .= '<rect width="' . $size . '" height="' . $size . '" fill="white"/>';
        
        // Generate a simple pattern based on URL hash (not a real QR code)
        $gridSize = 20;
        $cellSize = $size / $gridSize;
        
        for ($x = 0; $x < $gridSize; $x++) {
            for ($y = 0; $y < $gridSize; $y++) {
                $cellHash = hash('crc32', $urlHash . $x . $y);
                if (hexdec(substr($cellHash, 0, 1)) % 2) {
                    $svg .= '<rect x="' . ($x * $cellSize) . '" y="' . ($y * $cellSize) . '" width="' . $cellSize . '" height="' . $cellSize . '" fill="black"/>';
                }
            }
        }
        
        $svg .= '</svg>';
        
        return $svg;
    }

    /**
     * Generate batch QR codes for multiple events
     */
    public function generateBatchQRCodes(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'events' => 'required|array|min:1|max:10',
            'events.*.name' => 'required|string|max:255',
            'events.*.date' => 'required|string|max:100',
            'events.*.time' => 'required|string|max:100',
            'events.*.location' => 'required|string|max:255',
            'events.*.price' => 'required|numeric|min:0',
            'events.*.description' => 'nullable|string|max:500',
            'events.*.image' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $results = [];
            $baseUrl = config('app.frontend_url', 'http://localhost:3000');
            $paymentPath = '/qr-payment';

            foreach ($request->events as $index => $event) {
                $params = [
                    'name' => urlencode($event['name']),
                    'date' => urlencode($event['date']),
                    'time' => urlencode($event['time']),
                    'location' => urlencode($event['location']),
                    'price' => $event['price'],
                    'description' => urlencode($event['description'] ?? 'Amazing event experience'),
                    'image' => urlencode($event['image'] ?? '/waterfall-party.jpeg'),
                ];

                $queryString = http_build_query($params);
                $paymentUrl = $baseUrl . $paymentPath . '?' . $queryString;
                $qrCodeSvg = $this->generateSimpleQRCode($paymentUrl);

                $results[] = [
                    'event_index' => $index,
                    'event_name' => $event['name'],
                    'payment_url' => $paymentUrl,
                    'qr_code_svg' => $qrCodeSvg,
                    'short_url' => substr($paymentUrl, 0, 50) . '...' // Abbreviated for logs
                ];
            }

            Log::info('Batch QR codes generated', [
                'count' => count($results),
                'events' => array_column($request->events, 'name')
            ]);

            return response()->json([
                'success' => true,
                'results' => $results,
                'count' => count($results)
            ], 200);

        } catch (\Exception $e) {
            Log::error('Batch QR generation error', [
                'error' => $e->getMessage(),
                'event_count' => count($request->events ?? [])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate batch QR codes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get event details from a payment URL
     */
    public function parsePaymentURL(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payment_url' => 'required|string|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $url = parse_url($request->payment_url);
            
            if (!isset($url['query'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid payment URL format'
                ], 400);
            }

            parse_str($url['query'], $params);

            $eventDetails = [
                'name' => isset($params['name']) ? urldecode($params['name']) : null,
                'date' => isset($params['date']) ? urldecode($params['date']) : null,
                'time' => isset($params['time']) ? urldecode($params['time']) : null,
                'location' => isset($params['location']) ? urldecode($params['location']) : null,
                'price' => isset($params['price']) ? (float)$params['price'] : null,
                'description' => isset($params['description']) ? urldecode($params['description']) : null,
                'image' => isset($params['image']) ? urldecode($params['image']) : null,
            ];

            return response()->json([
                'success' => true,
                'event_details' => $eventDetails,
                'is_valid' => !empty($eventDetails['name']) && !empty($eventDetails['price'])
            ], 200);

        } catch (\Exception $e) {
            Log::error('URL parsing error', [
                'error' => $e->getMessage(),
                'url' => $request->payment_url
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to parse payment URL',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}