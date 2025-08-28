# 💳 Payment Providers Integration Guide
## Apple Pay, Google Pay & Additional Payment Methods

**Status**: Ready for Implementation  
**Domain**: phangan.ai  
**Current**: Test Environment → Production Ready

---

## 🎯 **Current Payment System Status**

### ✅ **Already Implemented**
- **Omise Gateway**: Full integration with test keys
- **Credit/Debit Cards**: Visa, MasterCard, JCB, American Express
- **Thai Payment Methods**: 
  - PromptPay (ready for integration)
  - TrueMoney Wallet (ready for integration)  
  - Internet Banking (ready for integration)
- **Multilingual Support**: Thai/English with auto-detection
- **Production Deployment**: phangan.ai ready

### 🔄 **Ready for Activation**
- Apple Pay (UI implemented, needs Omise activation)
- Google Pay (UI implemented, needs Omise activation)
- Live payment processing (switch to production keys)

---

## 🍎 **Apple Pay Integration**

### **Prerequisites**
1. **Apple Developer Account** (Required)
2. **Domain Verification** for phangan.ai
3. **Omise Apple Pay Configuration**

### **Step 1: Apple Developer Setup**
```bash
# 1. Register phangan.ai domain with Apple Pay
# 2. Download domain verification file
# 3. Upload to phangan.ai/.well-known/apple-developer-merchantid-domain-association
```

### **Step 2: Omise Configuration**
```javascript
// Already implemented in OmisePaymentWidget.tsx
const enableApplePay = () => {
  if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
    // Update payment method availability
    setApplePayAvailable(true);
  }
};
```

### **Step 3: Domain Verification File**
Create file at: `phangan.ai/.well-known/apple-developer-merchantid-domain-association`
```
# Apple Pay domain verification file
# Get from Apple Developer Console after merchant ID creation
```

### **Step 4: Update Payment Widget**
```typescript
// Update in OmisePaymentWidget.tsx
const paymentMethods = [
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: <ApplePayIcon />,
    available: applePayAvailable, // Dynamic based on device/browser
  },
  // ... other methods
];
```

---

## 🤖 **Google Pay Integration**

### **Prerequisites**
1. **Google Pay Business Console** setup
2. **Omise Google Pay Configuration**
3. **Domain verification**

### **Step 1: Google Pay Setup**
```javascript
// Google Pay configuration
const googlePayConfig = {
  environment: 'PRODUCTION', // or 'TEST'
  merchantInfo: {
    merchantName: 'Waterfall Festival Koh Phangan',
    merchantId: 'your-merchant-id', // From Google Pay Console
  },
  allowedPaymentMethods: [{
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['MASTERCARD', 'VISA'],
    },
  }],
};
```

### **Step 2: Integration Code**
```typescript
// Update OmisePaymentWidget.tsx
const initializeGooglePay = async () => {
  if (window.google && window.google.payments) {
    const paymentsClient = new window.google.payments.api.PaymentsClient({
      environment: 'PRODUCTION'
    });
    
    try {
      await paymentsClient.isReadyToPay(googlePayConfig);
      setGooglePayAvailable(true);
    } catch (error) {
      console.log('Google Pay not available:', error);
    }
  }
};
```

---

## 🇹🇭 **Thai Payment Methods Integration**

### **PromptPay Integration**
```typescript
const handlePromptPayPayment = async () => {
  const response = await fetch(`${apiUrl}/api/omise/charge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: {
        type: 'promptpay',
      },
      amount: totalAmount,
      currency: 'THB',
      metadata: { /* ticket details */ }
    })
  });
};
```

### **TrueMoney Wallet Integration**
```typescript
const handleTrueMoneyPayment = async () => {
  const response = await fetch(`${apiUrl}/api/omise/charge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: {
        type: 'truemoney',
        phone_number: userPhone, // Thai phone number
      },
      amount: totalAmount,
      currency: 'THB',
    })
  });
};
```

### **Internet Banking Integration**
```typescript
const handleInternetBankingPayment = async (bankCode: string) => {
  const response = await fetch(`${apiUrl}/api/omise/charge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: {
        type: 'internet_banking_' + bankCode, // e.g., 'internet_banking_scb'
      },
      amount: totalAmount,
      currency: 'THB',
    })
  });
};
```

---

## 🔧 **Backend Payment Processing Updates**

### **Enhanced OmisePaymentController**
```php
// Add to OmisePaymentController.php
public function createChargeWithSource(Request $request): JsonResponse
{
    $validator = Validator::make($request->all(), [
        'source' => 'required|array',
        'source.type' => 'required|string',
        'amount' => 'required|integer|min:1',
        'quantity' => 'required|integer|min:1|max:10',
        // ... other validation rules
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $chargeData = [
            'amount' => $request->amount,
            'currency' => 'THB',
            'source' => $request->source,
            'description' => "Waterfall Festival Tickets",
            'metadata' => [
                'event_name' => 'Waterfall Festival Koh Phangan',
                'attendee_name' => $request->attendee_name,
                'quantity' => $request->quantity,
            ]
        ];

        $charge = $this->createOmiseCharge($chargeData);
        
        // Handle different payment flows based on source type
        return $this->handleChargeResponse($charge, $request);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Payment processing failed',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

---

## 🚀 **Production Activation Steps**

### **Phase 1: Switch to Live Omise Keys**
```bash
# Update .env.gcp in Laravel API
OMISE_PUBLIC_KEY=pkey_live_your_live_public_key
OMISE_SECRET_KEY=skey_live_your_live_secret_key
```

### **Phase 2: Enable Apple Pay**
1. Complete Apple Developer setup
2. Upload domain verification file
3. Update payment method availability in widget
4. Test on iOS devices

### **Phase 3: Enable Google Pay**  
1. Complete Google Pay Business Console setup
2. Add Google Pay script to index.html
3. Update payment method availability in widget
4. Test on Android devices

### **Phase 4: Enable Thai Payment Methods**
1. Configure Omise dashboard for Thai methods
2. Update backend API endpoints
3. Test each payment method
4. Add bank selection UI for Internet Banking

---

## 🧪 **Testing Payment Providers**

### **Apple Pay Testing**
```javascript
// Test Apple Pay availability
if (window.ApplePaySession) {
  const merchantCapabilities = ['supports3DS'];
  const supportedNetworks = ['visa', 'masterCard'];
  
  if (ApplePaySession.canMakePaymentsWithActiveCard('your-merchant-id')) {
    console.log('✅ Apple Pay available');
  }
}
```

### **Google Pay Testing**  
```javascript
// Test Google Pay availability
const paymentsClient = new google.payments.api.PaymentsClient({
  environment: 'TEST' // Switch to 'PRODUCTION' when ready
});

paymentsClient.isReadyToPay(googlePayConfig)
  .then(response => {
    if (response.result) {
      console.log('✅ Google Pay available');
    }
  });
```

---

## 📋 **Implementation Checklist**

### **Apple Pay**
- [ ] Apple Developer Account setup
- [ ] Merchant ID creation
- [ ] Domain verification file uploaded
- [ ] SSL certificate configured
- [ ] Widget integration updated
- [ ] iOS device testing

### **Google Pay**
- [ ] Google Pay Business Console setup
- [ ] Merchant profile creation
- [ ] Domain verification
- [ ] Integration testing
- [ ] Android device testing

### **Thai Payment Methods**
- [ ] Omise dashboard configuration
- [ ] PromptPay integration
- [ ] TrueMoney integration  
- [ ] Internet Banking integration
- [ ] Bank selection UI
- [ ] Thai language testing

### **Production Readiness**
- [ ] Switch to live Omise keys
- [ ] Domain SSL verified
- [ ] Payment flow testing
- [ ] Error handling verified
- [ ] Mobile device testing
- [ ] Performance optimization

---

## 🎯 **Expected Timeline**

| Phase | Task | Duration |
|-------|------|----------|
| **Week 1** | Apple Pay setup & domain verification | 3-5 days |
| **Week 1** | Google Pay configuration | 2-3 days |
| **Week 2** | Thai payment methods integration | 4-6 days |
| **Week 2** | Production testing & optimization | 2-3 days |
| **Week 3** | Live deployment & monitoring | 1-2 days |

---

## 🔍 **Monitoring & Analytics**

### **Payment Method Usage Tracking**
```javascript
// Add to payment success handler
const trackPaymentMethod = (method: string, amount: number) => {
  // Google Analytics or custom analytics
  gtag('event', 'payment_success', {
    payment_method: method,
    value: amount,
    currency: 'THB',
    event_name: 'waterfall_festival_2025'
  });
};
```

### **Conversion Rate Monitoring**
- Track payment method selection rates
- Monitor completion rates by payment type
- A/B test payment method ordering
- Monitor mobile vs desktop usage

---

**🌊 Ready to enable all payment providers and go live on phangan.ai! 🎶**

*Next: Execute deployment and begin provider activation*