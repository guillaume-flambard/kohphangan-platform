<?php
// Test webhook locally by simulating Omise webhook calls
require 'vendor/autoload.php';

echo "Testing local webhook simulation...\n\n";

// Create a test ticket first
$baseUrl = 'http://localhost:8000/api';

// Simulate creating a charge that creates tickets
$testChargeId = 'chrg_test_' . uniqid();

echo "1. Creating test tickets for charge: $testChargeId\n";

// First create some test data by calling the charge endpoint
$chargeData = [
    'key' => 'charge.complete',
    'data' => [
        'id' => $testChargeId,
        'amount' => 150000,
        'paid' => true
    ]
];

$webhook_url = $baseUrl . '/omise/webhook';
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($chargeData)
    ]
]);

$result = file_get_contents($webhook_url, false, $context);
echo "Webhook response: " . $result . "\n\n";

// Now test the charge status endpoint
echo "2. Testing charge status endpoint...\n";
$status_url = $baseUrl . "/omise/payment/charge/{$testChargeId}/status";
$status_result = file_get_contents($status_url);
echo "Status response: " . $status_result . "\n\n";

echo "Test completed!\n";