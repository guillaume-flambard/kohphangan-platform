import React, {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Building2, Calendar, Clock, CreditCard, MapPin, Minus, Plus, Shield, Ticket} from 'lucide-react';

// Payment method icons
const ApplePayIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const GooglePayIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const PromptPayIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#1976D2"/>
  </svg>
);

const TrueMoneyIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#E31837"/>
    <text x="12" y="12" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">TRUE</text>
  </svg>
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
    }
  }
};

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
}

interface EventDetails {
  name: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
  price: number;
}

interface OmisePaymentWidgetProps {
  eventDetails: EventDetails;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

// Language detection and translations
const detectLanguage = () => {
  const lang = navigator.language || navigator.languages[0] || 'en';
  return lang.toLowerCase().startsWith('th') ? 'th' : 'en';
};

const translations = {
  en: {
    choosePayment: 'Choose Payment Method',
    tickets: 'Tickets',
    total: 'Total',
    ticket: 'ticket',
    tickets_plural: 'tickets',
    contactInfo: 'Contact Information',
    cardInfo: 'Card Information',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number (Optional)',
    cardHolder: 'Cardholder Name',
    cardNumber: 'Card Number',
    processing: 'Processing...',
    payButton: 'Pay',
    backToMethods: '← Back to payment methods',
    securedBy: 'Your payment is secured by Omise',
    trustLine: 'Secure payment • Instant confirmation • Powered by Omise',
    comingSoon: 'Coming Soon',
    available: 'Available',
    unavailable: 'Unavailable',
    selectPayment: 'Select Payment Method',
    soldBy: 'Sold by',
    quantity: 'Quantity',
    perTicket: 'per ticket',
    continue: 'Continue',
    back: 'Back',
    languageNote: '🇹🇭 Switch to Thai for local payment methods',
    // Event translations
    eventName: 'Waterfall Festival Echo',
    eventDescription: 'Final Echo - The last waterfall rave of 2025. Four stages, jungle vibes, sunrise magic.',
    eventLocation: 'Secret Waterfall, Koh Phangan',
    ticketProvider: 'Tickets provided by Echo',
    // Days of week
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    // Months
    months: ['January', 'February', 'March', 'April', 'May', 'June', 
             'July', 'August', 'September', 'October', 'November', 'December'],
    // Payment method names
    promptPayName: 'PromptPay',
    truemoneyName: 'TrueMoney Wallet',
    internetBankingName: 'Internet Banking',
    creditCardName: 'Credit/Debit Card'
  },
  th: {
    choosePayment: 'เลือกวิธีการชำระเงิน',
    tickets: 'ตั๋ว',
    total: 'รวม',
    ticket: 'ตั๋ว',
    tickets_plural: 'ตั๋ว',
    contactInfo: 'ข้อมูลติดต่อ',
    cardInfo: 'ข้อมูลบัตร',
    fullName: 'ชื่อ-นามสกุล',
    email: 'อีเมล',
    phone: 'หมายเลขโทรศัพท์ (ไม่บังคับ)',
    cardHolder: 'ชื่อผู้ถือบัตร',
    cardNumber: 'หมายเลขบัตร',
    processing: 'กำลังดำเนินการ...',
    payButton: 'ชำระเงิน',
    backToMethods: '← กลับไปที่วิธีชำระเงิน',
    securedBy: 'การชำระเงินของคุณได้รับการรักษาความปลอดภัยโดย Omise',
    trustLine: 'ชำระเงินปลอดภัย • ยืนยันทันที • ขับเคลื่อนโดย Omise',
    // Payment method names in Thai
    promptPayName: 'พร้อมเพย์',
    truemoneyName: 'ทรูมันนี่ วอลเล็ต',
    internetBankingName: 'อินเทอร์เน็ตแบงก์กิ้ง',
    creditCardName: 'บัตรเครดิต/เดบิต',
    comingSoon: 'ไม่พร้อมใช้งาน',
    available: 'พร้อมใช้งาน',
    unavailable: 'ไม่พร้อมใช้งาน',
    selectPayment: 'วิธีการชำระเงิน',
    soldBy: 'จำหน่ายโดย',
    quantity: 'จำนวน',
    perTicket: 'ต่อใบ',
    continue: 'ดำเนินการต่อ',
    back: 'กลับ',
    languageNote: '🇺🇸 เปลี่ยนเป็นภาษาอังกฤษสำหรับบัตรเครดิตต่างประเทศ',
    // Additional UI translations
    selectQuantity: 'เลือกจำนวน',
    confirmPayment: 'ยืนยันการชำระเงิน',
    next: 'ถัดไป',
    cancel: 'ยกเลิก',
    retry: 'ลองอีกครั้ง',
    // Payment status messages
    paymentSuccessful: 'ชำระเงินสำเร็จ',
    paymentFailed: 'ชำระเงินไม่สำเร็จ',
    paymentPending: 'รอการชำระเงิน',
    paymentCancelled: 'ยกเลิกการชำระเงิน',
    // Error messages
    invalidInput: 'ข้อมูลไม่ถูกต้อง',
    networkError: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    tryAgain: 'โปรดลองอีกครั้ง',
    // Form validation
    required: 'จำเป็นต้องกรอก',
    invalidEmail: 'รูปแบบอีเมลไม่ถูกต้อง',
    invalidCard: 'หมายเลขบัตรไม่ถูกต้อง',
    // Event translations
    eventName: 'เทศกาลน้ำตก เกาะพะงัน',
    eventDescription: 'คืนสุดท้ายที่จะได้หลงใหลไปกับเสียงดนตรี บรรยากาศป่า และมนต์เสน่ห์พระอาทิตย์ขึ้น',
    ticketProvider: 'จำหน่ายโดย Echo',
    eventLocation: 'น้ำตกลับ เกาะพะงัน',
    // Days of week in Thai
    days: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'],
    // Months in Thai
    months: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
             'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
  }
};

// Date formatting utilities
const formatDateForLanguage = (dateString: string, language: 'en' | 'th', t: unknown) => {
  try {
    // Parse the original date string (e.g., "Friday, Aug 29, 2025")
    const date = new Date(dateString);
    
    if (language === 'th') {
      // Thai Buddhist Era (BE) = AD + 543
      const thaiYear = date.getFullYear() + 543;
      const dayName = t.days[date.getDay()];
      const monthName = t.months[date.getMonth()];
      const day = date.getDate();
      
      return `${dayName}ที่ ${day} ${monthName} ${thaiYear}`;
    }
    
    return dateString; // Return original for English
  } catch (error) {
    return dateString; // Fallback to original string
  }
};

const translateEventDetails = (eventDetails: EventDetails, language: 'en' | 'th', t: unknown) => {
  if (language === 'th') {
    return {
      ...eventDetails,
      name: eventDetails.name.toLowerCase().includes('waterfall') ? t.eventName : eventDetails.name,
      description: eventDetails.description.toLowerCase().includes('echo') ? t.eventDescription : eventDetails.description,
      location: eventDetails.location.toLowerCase().includes('phangan') ? t.eventLocation : eventDetails.location,
      date: formatDateForLanguage(eventDetails.date, language, t)
    };
  }
  
  return {
    ...eventDetails,
    date: formatDateForLanguage(eventDetails.date, language, t)
  };
};

export default function OmisePaymentWidget({ 
  eventDetails, 
  onSuccess, 
  onError 
}: OmisePaymentWidgetProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [omisePublicKey, setOmisePublicKey] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  
  // Form data
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    attendee_phone: '',
    card_number: '',
    card_expiry_month: '',
    card_expiry_year: '',
    card_cvv: '',
    card_holder_name: ''
  });

  // Detect language on mount
  useEffect(() => {
    setLanguage(detectLanguage());
  }, []);

  const t = translations[language];
  const translatedEventDetails = translateEventDetails(eventDetails, language, t);

  const getPaymentMethods = (lang: 'en' | 'th'): PaymentMethod[] => {
    const t = translations[lang];
    
    const commonMethods = [
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        icon: <ApplePayIcon />,
        available: false // Will be determined by Apple Pay availability
      },
      {
        id: 'google_pay',
        name: 'Google Pay', 
        icon: <GooglePayIcon />,
        available: false // Will be determined by Google Pay availability
      },
      {
        id: 'credit_card',
        name: lang === 'th' ? t.creditCardName : 'Credit/Debit Card',
        icon: <CreditCard className="w-6 h-6" />,
        available: true
      }
    ];

    // Add Thai-specific payment methods
    if (lang === 'th') {
      return [
        {
          id: 'promptpay',
          name: t.promptPayName,
          icon: <PromptPayIcon />,
          available: true
        },
        {
          id: 'truemoney',
          name: t.truemoneyName,
          icon: <TrueMoneyIcon />,
          available: true
        },
        {
          id: 'internet_banking',
          name: t.internetBankingName,
          icon: <Building2 className="w-6 h-6" />,
          available: true
        },
        ...commonMethods
      ];
    }

    return commonMethods;
  };

  const paymentMethods = getPaymentMethods(language);

  const totalPrice = eventDetails.price * ticketQuantity;

  // Load Omise.js and get public key
  useEffect(() => {
    const loadOmise = async () => {
      try {
        // Load Omise.js script
        const script = document.createElement('script');
        script.src = 'https://cdn.omise.co/omise.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = async () => {
          // Get public key from backend
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
          const response = await fetch(`${apiUrl}/api/omise/public-key`);
          const data = await response.json();
          
          if (data.success && data.public_key) {
            setOmisePublicKey(data.public_key);
            (window as unknown).Omise.setPublicKey(data.public_key);
          }
        };

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Failed to load Omise:', error);
        onError?.('Payment system initialization failed');
      }
    };

    loadOmise();
  }, [onError]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === 'credit_card') {
      setShowForm(true);
    } else {
      // Handle Apple Pay / Google Pay
      handleAlternativePayment(method);
    }
  };

  const handleAlternativePayment = async (method: string) => {
    setIsProcessing(true);
    try {
      // This would integrate with Apple Pay / Google Pay APIs
      onError?.(`${method} is not yet implemented`);
    } catch (error) {
      onError?.(`${method} payment failed`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!omisePublicKey) {
      onError?.('Payment system not ready');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Omise token
      const tokenData = {
        card: {
          name: formData.card_holder_name,
          number: formData.card_number.replace(/\s/g, ''),
          expiration_month: parseInt(formData.card_expiry_month),
          expiration_year: parseInt(formData.card_expiry_year),
          security_code: formData.card_cvv,
        }
      };

      (window as unknown).Omise.createToken('card', tokenData, async (statusCode: number, token: unknown) => {
        if (statusCode === 200) {
          try {
            // Send payment request to backend
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
            const paymentResponse = await fetch(`${apiUrl}/api/omise/charge`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: token.id,
                amount: eventDetails.price * 100, // Convert to satang
                quantity: ticketQuantity,
                attendee_name: formData.attendee_name,
                attendee_email: formData.attendee_email,
                attendee_phone: formData.attendee_phone,
              })
            });

            const result = await paymentResponse.json();

            if (result.success) {
              onSuccess?.(result);
            } else {
              onError?.(result.message || 'Payment failed');
            }
          } catch (error) {
            onError?.('Payment processing failed');
          }
        } else {
          onError?.(token.message || 'Card validation failed');
        }
        
        setIsProcessing(false);
      });

    } catch (error) {
      onError?.('Payment failed');
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Enhanced Language Toggle for Tourists */}
      <motion.div 
        className="mb-6 space-y-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Language hint */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-white/80 mb-2">
            {language === 'en' ? t.languageNote : t.languageNote}
          </p>
        </motion.div>
        
        {/* Language toggle */}
        <div className="flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 border border-gray-200 shadow-lg overflow-hidden">
            <motion.button
              onClick={() => setLanguage('en')}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 overflow-hidden ${
                language === 'en' 
                  ? 'bg-gray-200 text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs flex-shrink-0">🇺🇸</span>
              <span className="whitespace-nowrap overflow-hidden">EN</span>
            </motion.button>
            <motion.button
              onClick={() => setLanguage('th')}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 overflow-hidden ${
                language === 'th' 
                  ? 'bg-gray-200 text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs flex-shrink-0">🇹🇭</span>
              <span className="whitespace-nowrap overflow-hidden">ไทย</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 backdrop-blur-sm"
      >
        {/* Event Header */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden"
        >
          <motion.img
            src={eventDetails.image}
            alt={eventDetails.name}
            className="w-full h-48 object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8,  }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Description overlay with blur but no card */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold leading-tight text-white mb-2">
                {translatedEventDetails.name}
              </h2>
              <p className="text-sm text-white/90 leading-relaxed">
                {translatedEventDetails.description}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Event Details */}
        <div className="p-6 space-y-4">
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 gap-3 text-sm"
          >
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">{translatedEventDetails.date}</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">{translatedEventDetails.time}</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">{translatedEventDetails.location}</span>
            </motion.div>
          </motion.div>

          {/* Ticket Quantity */}
          <motion.div 
            variants={itemVariants}
            className="border-t pt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{language === 'th' ? t.quantity : t.tickets}</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <motion.span 
                  key={ticketQuantity}
                  initial={{ scale: 1.2, color: "#3B82F6" }}
                  animate={{ scale: 1, color: "#000000" }}
                  className="w-8 text-center font-semibold"
                >
                  {ticketQuantity}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            
            <motion.div 
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
              whileHover={{ 
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.1)",
                borderColor: "rgba(59, 130, 246, 0.3)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.total}</span>
                <motion.span 
                  key={totalPrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-blue-600"
                >
                  ฿{totalPrice.toLocaleString()}
                </motion.span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ฿{eventDetails.price.toLocaleString()} × {ticketQuantity} {ticketQuantity > 1 ? t.tickets_plural : t.ticket}
              </div>
              {language === 'th' && (
                <div className="text-xs text-gray-400 mt-1">
                  {t.ticketProvider}
                </div>
              )}
              {language === 'en' && (
                <div className="text-xs text-gray-400 mt-1">
                  Tickets provided by Echo
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Payment Methods */}
          {!showForm && (
            <motion.div 
              variants={itemVariants}
              className="space-y-3"
            >
              <h3 className="font-semibold text-gray-800">{language === 'th' ? t.selectPayment : t.choosePayment}</h3>
              <div className="space-y-2">
                {paymentMethods.map((method, index) => (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ 
                      scale: method.available ? 1.02 : 1,
                      boxShadow: method.available ? "0 8px 25px rgba(59, 130, 246, 0.1)" : "none"
                    }}
                    onClick={() => method.available && handleMethodSelect(method.id)}
                    disabled={!method.available || isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                      method.available
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="text-blue-600"
                        whileHover={{ rotate: method.available ? 5 : 0 }}
                      >
                        {method.icon}
                      </motion.div>
                      <span className="font-medium flex-1 text-left">{method.name}</span>
                      {method.available && (
                        <motion.div 
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      {!method.available && (
                        <span className="text-xs text-gray-400">{t.comingSoon}</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Credit Card Form */}
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  height: 'auto', 
                  y: 0,
                  transition: {
                    duration: 0.5,
                                }
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0, 
                  y: -20,
                  transition: { duration: 0.3 }
                }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowForm(false)}
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {t.backToMethods}
                  </motion.button>
                </div>

                {/* Personal Information */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h4 className="font-medium text-gray-800">{t.contactInfo}</h4>
                  <motion.input
                    type="text"
                    placeholder={t.fullName}
                    value={formData.attendee_name}
                    onChange={(e) => handleInputChange('attendee_name', e.target.value)}
                    required
                    whileFocus={{ scale: 1.02 }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <motion.input
                    type="email"
                    placeholder={t.email}
                    value={formData.attendee_email}
                    onChange={(e) => handleInputChange('attendee_email', e.target.value)}
                    required
                    whileFocus={{ scale: 1.02 }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <motion.input
                    type="tel"
                    placeholder={t.phone}
                    value={formData.attendee_phone}
                    onChange={(e) => handleInputChange('attendee_phone', e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </motion.div>

                {/* Card Information */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="font-medium text-gray-800">{t.cardInfo}</h4>
                  <motion.input
                    type="text"
                    placeholder={t.cardHolder}
                    value={formData.card_holder_name}
                    onChange={(e) => handleInputChange('card_holder_name', e.target.value)}
                    required
                    whileFocus={{ scale: 1.02 }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <motion.input
                    type="text"
                    placeholder={t.cardNumber}
                    value={formData.card_number}
                    onChange={(e) => handleInputChange('card_number', formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                    whileFocus={{ scale: 1.02 }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <motion.select
                      value={formData.card_expiry_month}
                      onChange={(e) => handleInputChange('card_expiry_month', e.target.value)}
                      required
                      whileFocus={{ scale: 1.02 }}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">MM</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </motion.select>
                    <motion.select
                      value={formData.card_expiry_year}
                      onChange={(e) => handleInputChange('card_expiry_year', e.target.value)}
                      required
                      whileFocus={{ scale: 1.02 }}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">YYYY</option>
                      {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </motion.select>
                    <motion.input
                      type="text"
                      placeholder="CVV"
                      value={formData.card_cvv}
                      onChange={(e) => handleInputChange('card_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      required
                      whileFocus={{ scale: 1.02 }}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>

                {/* Security Badge */}
                <motion.div 
                  className="flex items-center gap-2 text-sm text-gray-600 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="w-4 h-4 text-green-600" />
                  </motion.div>
                  <span>{t.securedBy}</span>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isProcessing}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ 
                    scale: isProcessing ? 1 : 1.02,
                    boxShadow: isProcessing ? "none" : "0 10px 25px rgba(59, 130, 246, 0.3)"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div 
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>{t.processing}</span>
                    </div>
                  ) : (
                    `${t.payButton} ฿${totalPrice.toLocaleString()}`
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Trust Indicators */}
          {!showForm && (
            <motion.div 
              variants={itemVariants}
              className="text-center text-xs text-gray-500 pt-4 border-t"
            >
              <p>{t.trustLine}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}