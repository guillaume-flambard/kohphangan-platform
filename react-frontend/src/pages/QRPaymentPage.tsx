import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import OmisePaymentWidget from '../components/OmisePaymentWidget';

interface EventDetails {
  name: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
  price: number;
}

export default function QRPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  // Extract event details from URL parameters
  useEffect(() => {
    const name = searchParams.get('name') || 'Waterfall Festival Koh Phangan';
    const date = searchParams.get('date') || 'Wednesday, Aug 27, 2025';
    const time = searchParams.get('time') || '9:00 PM - 7:00 AM';
    const location = searchParams.get('location') || 'Waterfall Festival, Koh Phangan';
    const image = searchParams.get('image') || '/waterfall-party.jpeg';
    const description = searchParams.get('description') || 'One last night to lose yourself in sound, jungle, and sunrise magic.';
    const price = parseInt(searchParams.get('price') || '900');

    setEventDetails({
      name: decodeURIComponent(name),
      date: decodeURIComponent(date),
      time: decodeURIComponent(time),
      location: decodeURIComponent(location),
      image: decodeURIComponent(image),
      description: decodeURIComponent(description),
      price
    });
  }, [searchParams]);

  const handlePaymentSuccess = (data: any) => {
    setPaymentStatus('success');
    setTickets(data.tickets || []);
    setPaymentMessage(`Payment successful! ${data.tickets?.length || 0} ticket(s) generated.`);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setPaymentMessage(error);
  };

  const handleBackToEvent = () => {
    // Navigate back or close if embedded
    window.history.back();
  };

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

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

      {/* Header with back button */}
      <div className="relative z-10 p-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBackToEvent}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Event</span>
        </motion.button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 max-w-md">
        <AnimatePresence mode="wait">
          {paymentStatus === 'idle' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OmisePaymentWidget
                eventDetails={eventDetails}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </motion.div>
          )}

          {paymentStatus === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600">{paymentMessage}</p>
              </div>

              {tickets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Your Tickets</h3>
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{ticket.ticket_number}</div>
                          <div className="text-sm text-gray-600">{ticket.attendee_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">฿{ticket.price}</div>
                          <div className="text-xs text-gray-500">QR: {ticket.qr_code?.slice(-8) || 'N/A'}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaymentStatus('idle')}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Buy More Tickets
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToEvent}
                  className="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Back to Event Page
                </motion.button>
              </div>
            </motion.div>
          )}

          {paymentStatus === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto"
              >
                <XCircle className="w-12 h-12 text-red-600" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600">{paymentMessage}</p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaymentStatus('idle')}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Try Again
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToEvent}
                  className="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Back to Event Page
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/70 text-xs mt-6"
        >
          <p>🔗 Payment via QR code scan</p>
          <p>Secure • Fast • Mobile optimized</p>
        </motion.div>
      </div>
    </div>
  );
}