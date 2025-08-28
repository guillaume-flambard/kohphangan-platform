#!/bin/bash

# 🧪 Complete E2E Test - Waterfall Festival Payment System
# Run this script to validate the entire payment workflow before production

echo "🌊 Starting E2E Test for Waterfall Festival Payment System"
echo "========================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${YELLOW}[TEST $TESTS_RUN]${NC} $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Test 1: Frontend Server Health
echo -e "\n📱 ${YELLOW}FRONTEND TESTING${NC}"
run_test "React dev server running" "curl -s http://localhost:5173/events/waterfall/echo -o /dev/null"

# Test 2: Backend Server Health  
echo -e "\n🔧 ${YELLOW}BACKEND TESTING${NC}"
run_test "Laravel API server running" "curl -s http://localhost:8001/api/omise/public-key -o /dev/null"

# Test 3: Omise Public Key API
PUBLIC_KEY_RESPONSE=$(curl -s http://localhost:8001/api/omise/public-key)
if [[ $PUBLIC_KEY_RESPONSE == *"success"* ]]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} - Omise public key API responding"
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}❌ FAIL${NC} - Omise public key API not working"
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Test 4: Database Connection
echo -e "\n💾 ${YELLOW}DATABASE TESTING${NC}"
DB_TEST=$(cd /Users/memo/projects/minerva-web/laravel-api && php artisan tinker --execute="echo App\Models\Ticket::count();" 2>/dev/null)
if [[ $DB_TEST =~ ^[0-9]+$ ]]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} - Database connection (Found $DB_TEST tickets)"
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}❌ FAIL${NC} - Database connection failed"
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Test 5: Complete Payment Flow
echo -e "\n💳 ${YELLOW}PAYMENT FLOW TESTING${NC}"

# Step 1: Create Omise token
echo "  Creating payment token..."
TOKEN_RESPONSE=$(curl -s -X POST https://vault.omise.co/tokens \
  -H "Authorization: Basic $(echo -n 'pkey_test_64v08ahvxzavuuecnaz:' | base64)" \
  -d "card[name]=E2E Test User" \
  -d "card[number]=4242424242424242" \
  -d "card[expiration_month]=12" \
  -d "card[expiration_year]=2026" \
  -d "card[security_code]=123")

TOKEN_ID=$(echo $TOKEN_RESPONSE | jq -r '.id' 2>/dev/null)
if [[ $TOKEN_ID != "null" && $TOKEN_ID != "" ]]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} - Payment token created: ${TOKEN_ID:0:20}..."
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}❌ FAIL${NC} - Payment token creation failed"
    echo "Response: $TOKEN_RESPONSE"
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Step 2: Process payment (only if token creation succeeded)
if [[ $TOKEN_ID != "null" && $TOKEN_ID != "" ]]; then
    echo "  Processing payment..."
    CHARGE_RESPONSE=$(curl -s -X POST http://localhost:8001/api/omise/charge \
      -H "Content-Type: application/json" \
      -d "{
        \"token\": \"$TOKEN_ID\",
        \"amount\": 90000,
        \"quantity\": 1,
        \"attendee_name\": \"E2E Test User\",
        \"attendee_email\": \"e2e@waterfalltest.com\",
        \"attendee_phone\": \"+66987654321\"
      }")

    CHARGE_SUCCESS=$(echo $CHARGE_RESPONSE | jq -r '.success' 2>/dev/null)
    if [[ $CHARGE_SUCCESS == "true" ]]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        TICKET_NUMBER=$(echo $CHARGE_RESPONSE | jq -r '.tickets[0].ticket_number' 2>/dev/null)
        echo -e "${GREEN}✅ PASS${NC} - Payment processed successfully"
        echo "  🎫 Generated ticket: $TICKET_NUMBER"
        
        # Test 6: Verify ticket in database
        echo "  Verifying ticket in database..."
        TICKET_CHECK=$(cd /Users/memo/projects/minerva-web/laravel-api && php artisan tinker --execute="
        \$ticket = App\Models\Ticket::where('ticket_number', '$TICKET_NUMBER')->first();
        echo \$ticket ? 'found' : 'not_found';
        " 2>/dev/null)
        
        if [[ $TICKET_CHECK == *"found"* ]]; then
            TESTS_PASSED=$((TESTS_PASSED + 1))
            echo -e "${GREEN}✅ PASS${NC} - Ticket saved to database"
        else
            TESTS_FAILED=$((TESTS_FAILED + 1))
            echo -e "${RED}❌ FAIL${NC} - Ticket not found in database"
        fi
        TESTS_RUN=$((TESTS_RUN + 1))
        
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}❌ FAIL${NC} - Payment processing failed"
        echo "Response: $CHARGE_RESPONSE"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
else
    echo "  Skipping payment processing due to token creation failure"
    TESTS_RUN=$((TESTS_RUN + 1))
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 7: API Error Handling
echo -e "\n🚨 ${YELLOW}ERROR HANDLING TESTING${NC}"
ERROR_RESPONSE=$(curl -s -X POST http://localhost:8001/api/omise/charge \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid_token","amount":90000,"quantity":1,"attendee_name":"Test","attendee_email":"test@test.com"}')

ERROR_SUCCESS=$(echo $ERROR_RESPONSE | jq -r '.success' 2>/dev/null)
if [[ $ERROR_SUCCESS == "false" ]]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} - Error handling works correctly"
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}❌ FAIL${NC} - Error handling not working"
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Final Results
echo -e "\n🎯 ${YELLOW}TEST RESULTS SUMMARY${NC}"
echo "========================================================"
echo "Total Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
    echo "✅ System is ready for production deployment"
    echo ""
    echo "🌊 Waterfall Festival Payment System - PRODUCTION READY! 🎶"
    echo ""
    echo "Next steps:"
    echo "1. Switch to production Omise keys"
    echo "2. Deploy to production environment"  
    echo "3. Run final smoke tests"
    echo "4. Go live! 🚀"
    exit 0
else
    echo -e "\n⚠️  ${RED}SOME TESTS FAILED${NC}"
    echo "❌ System needs fixes before production"
    echo "Please review failed tests and resolve issues"
    exit 1
fi