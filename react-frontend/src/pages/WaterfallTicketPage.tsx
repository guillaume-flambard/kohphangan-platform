import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Music, 
  Download, 
  Share2, 
  Image as ImageIcon,
  CreditCard,
  Banknote,
  Sparkles,
  Waves,
  Phone,
  User
} from 'lucide-react';
import QRCode from 'qrcode';

interface TicketData {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  price: number;
  ticketHolder: string;
  phone: string;
  purchaseTime: string;
  qrCode: string;
}

export default function WaterfallTicketPage() {
  const [currentStep, setCurrentStep] = useState<'event' | 'processing' | 'ticket'>('event');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const eventDetails = {
    name: 'Waterfall Party Echo',
    date: 'Saturday, Aug 24, 2025',
    time: '8:00 PM - 4:00 AM',
    location: 'Secret Waterfall, Koh Phangan',
    price: 900,
    description: 'Experience the ultimate tropical party under the stars at our secret waterfall location. Dance to world-class DJs surrounded by nature\'s beauty.',
    included: ['Welcome drink', 'Professional DJ sets', 'Light show', 'Security', 'Chill-out areas', 'Photo opportunities']
  };

  const generateTicket = async (name: string, phone: string, _method: 'cash' | 'card') => {
    const ticketId = `WFE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const purchaseTime = new Date().toISOString();
    
    const ticket: TicketData = {
      id: ticketId,
      eventName: eventDetails.name,
      date: eventDetails.date,
      time: eventDetails.time,
      location: eventDetails.location,
      price: eventDetails.price,
      ticketHolder: name,
      phone: phone,
      purchaseTime: purchaseTime,
      qrCode: ''
    };

    // Generate QR code with ticket verification data
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      event: ticket.eventName,
      holder: ticket.ticketHolder,
      date: ticket.date,
      verified: true
    });

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff',
        },
      });
      ticket.qrCode = qrCodeDataUrl;
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }

    setTicketData(ticket);
    
    // Store in localStorage for persistence
    localStorage.setItem(`ticket-${ticketId}`, JSON.stringify(ticket));
    
    return ticket;
  };

  const handlePayment = async (method: 'cash' | 'card') => {
    setPaymentMethod(method);
    setCurrentStep('processing');
    setLoading(true);

    if (method === 'cash') {
      // For cash payment, we still need basic info
      if (!formData.name.trim() || !formData.phone.trim()) {
        alert('Please fill in your name and phone number for cash reservation');
        setCurrentStep('event');
        setLoading(false);
        return;
      }
      // Simulate processing time for cash payment
      setTimeout(async () => {
        await generateTicket(formData.name, formData.phone, 'cash');
        setLoading(false);
        setCurrentStep('ticket');
      }, 2000);
    } else {
      // Card payment with Tab widget - it handles customer info collection
      try {
        // Initialize Tab payment widget
        if (window.TabCheckout) {
          window.TabCheckout.open({
            amount: eventDetails.price,
            currency: 'THB',
            description: `${eventDetails.name} - ${eventDetails.date}`,
            onSuccess: async (result: any) => {
              // Get customer info from widget result
              const customerName = result?.customer?.name || 'Ticket Holder';
              const customerPhone = result?.customer?.phone || '';
              await generateTicket(customerName, customerPhone, 'card');
              setLoading(false);
              setCurrentStep('ticket');
            },
            onError: (error: any) => {
              console.error('Payment error:', error);
              setLoading(false);
              setCurrentStep('event');
              alert('Payment failed. Please try again.');
            },
            onCancel: () => {
              setLoading(false);
              setCurrentStep('event');
            }
          });
        } else {
          // Fallback if widget not loaded
          setTimeout(async () => {
            await generateTicket('Ticket Holder', '', 'card');
            setLoading(false);
            setCurrentStep('ticket');
          }, 2000);
        }
      } catch (error) {
        console.error('Widget error:', error);
        setLoading(false);
        setCurrentStep('event');
      }
    }
  };

  const downloadPDF = async () => {
    if (!ticketData) return;

    // Create a canvas to render the ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    // Fill background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#3730a3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    // Add white background for ticket content
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.roundRect(20, 20, 360, 560, 15);
    ctx.fill();

    // Add text content
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(ticketData.eventName, 40, 80);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(ticketData.date, 40, 120);
    ctx.fillText(ticketData.time, 40, 150);
    ctx.fillText(ticketData.location, 40, 180);

    ctx.fillText(`Ticket Holder: ${ticketData.ticketHolder}`, 40, 220);
    ctx.fillText(`Phone: ${ticketData.phone}`, 40, 250);
    ctx.fillText(`Ticket ID: ${ticketData.id}`, 40, 280);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#059669';
    ctx.fillText(`฿${ticketData.price}`, 40, 320);

    // Add QR code if available
    if (qrCodeUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 150, 350, 150, 150);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `waterfall-party-ticket-${ticketData.id}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      img.src = qrCodeUrl;
    }
  };

  const shareTicket = async () => {
    if (!ticketData) return;

    const shareData = {
      title: `${ticketData.eventName} - Ticket`,
      text: `I'm going to ${ticketData.eventName} on ${ticketData.date}! 🎉`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Ticket details copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Ticket details copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard failed:', clipboardError);
      }
    }
  };

  const saveToGallery = () => {
    if (qrCodeUrl) {
      const a = document.createElement('a');
      a.href = qrCodeUrl;
      a.download = `waterfall-party-qr-${ticketData?.id}.png`;
      a.click();
    }
  };

  // Load Tab widget
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      window.widgetSettings = {
        businessCode: "eeatl",
      };
      (()=>{function t(){window.widgetSettings.baseURL=window.widgetSettings.baseURL||"https://checkout.tab.travel";var t=document.createElement("script"),e=(t.type="text/javascript",t.async=!0,t.src="https://checkout.tab.travel/widget.js",document.getElementsByTagName("script")[0]);e.parentNode.insertBefore(t,e)}"complete"===document.readyState?t():window.attachEvent?window.attachEvent("onload",t):window.addEventListener("load",t,!1)})();
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-teal-400 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        <AnimatePresence mode="wait">
          {currentStep === 'event' && (
            <motion.div
              key="event"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Event Header */}
              <div className="text-center text-white space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full mb-4"
                >
                  <Waves className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-teal-200 bg-clip-text text-transparent">
                  {eventDetails.name}
                </h1>
                <div className="flex items-center justify-center gap-2 text-blue-200">
                  <Sparkles className="w-5 h-5" />
                  <span>Tropical Paradise Experience</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* Event Details Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 text-white">
                    <Calendar className="w-5 h-5 text-blue-300" />
                    <span>{eventDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Clock className="w-5 h-5 text-blue-300" />
                    <span>{eventDetails.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <MapPin className="w-5 h-5 text-blue-300" />
                    <span>{eventDetails.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Music className="w-5 h-5 text-blue-300" />
                    <span>Electronic • Tropical House • Chill</span>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {eventDetails.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-semibold">What's Included:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {eventDetails.included.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-blue-100 text-sm">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-center">
                  <div className="text-white text-2xl font-bold">
                    ฿{eventDetails.price.toLocaleString()}
                  </div>
                  <div className="text-green-100 text-sm">per person</div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4"
              >
                <h3 className="text-white font-semibold text-center">Your Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-blue-300" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-blue-300" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="+66 XX XXX XXXX"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <button
                  onClick={() => handlePayment('card')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <CreditCard className="w-6 h-6" />
                  Pay with Card - ฿{eventDetails.price.toLocaleString()}
                </button>
                
                <button
                  onClick={() => handlePayment('cash')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <Banknote className="w-6 h-6" />
                  Reserve with Cash - ฿{eventDetails.price.toLocaleString()}
                </button>
              </motion.div>

              <div className="text-center text-blue-200 text-sm">
                <p>Secure payment • Instant confirmation • Mobile optimized</p>
              </div>
            </motion.div>
          )}


          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-96 text-center space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
              />
              <div className="text-white space-y-2">
                <h3 className="text-xl font-semibold">
                  {paymentMethod === 'card' ? 'Processing Payment...' : 'Generating Ticket...'}
                </h3>
                <p className="text-blue-200">
                  {paymentMethod === 'card' 
                    ? 'Please wait while we process your payment'
                    : 'Creating your reservation ticket'
                  }
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2 text-blue-300"
              >
                <Waves className="w-5 h-5" />
                <span className="text-sm">Almost there...</span>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'ticket' && ticketData && (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center text-white space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mb-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: 2 }}
                  >
                    ✓
                  </motion.div>
                </motion.div>
                <h2 className="text-2xl font-bold">Ticket Generated!</h2>
                <p className="text-green-200">
                  Your {paymentMethod === 'cash' ? 'reservation' : 'ticket'} is ready
                </p>
              </div>

              {/* Ticket Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-2xl"
              >
                <div className="space-y-4">
                  {/* Ticket Header */}
                  <div className="text-center border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800">{ticketData.eventName}</h3>
                    <p className="text-blue-600 font-semibold">{ticketData.date}</p>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <div className="font-semibold text-gray-800">{ticketData.time}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <div className="font-semibold text-gray-800">{ticketData.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Holder:</span>
                      <div className="font-semibold text-gray-800">{ticketData.ticketHolder}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <div className="font-semibold text-gray-800">{ticketData.phone}</div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div className="flex justify-center py-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <img src={qrCodeUrl} alt="Ticket QR Code" className="w-32 h-32" />
                      </div>
                    </div>
                  )}

                  {/* Ticket ID and Price */}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      ID: {ticketData.id}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ฿{ticketData.price.toLocaleString()}
                    </div>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm font-semibold">Cash Payment Required</p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Present this ticket and pay ฿{ticketData.price.toLocaleString()} at the event entrance
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 gap-3"
              >
                <button
                  onClick={downloadPDF}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Download Ticket
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={saveToGallery}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Save QR
                  </button>
                  
                  <button
                    onClick={shareTicket}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </motion.div>

              <div className="text-center text-blue-200 text-sm space-y-2">
                <p>Keep this ticket safe - you'll need it for entry!</p>
                <p className="text-xs">Ticket saved to your device automatically</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}