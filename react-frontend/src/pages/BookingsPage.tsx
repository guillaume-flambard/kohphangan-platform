import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, QrCode, Download, RefreshCw, Ticket, Car } from 'lucide-react';

interface Booking {
  id: string;
  booking_reference: string;
  event: {
    id: string;
    title: string;
    start_datetime: string;
    end_datetime?: string;
    venue?: string;
    location_details?: {
      address: string;
      coordinates?: [number, number];
    };
    photos?: string[];
  };
  ticket_type: {
    name: string;
    includes?: string[];
  };
  quantity: number;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  check_in_status: 'pending' | 'checked_in' | 'no_show';
  qr_code?: string;
  notes?: string;
  created_at: string;
  qr_codes?: Array<{
    attendee_name: string;
    qr_code: string;
    used_at?: string;
  }>;
}

interface TransportBooking {
  id: string;
  booking_reference: string;
  departure_datetime: string;
  arrival_datetime: string;
  departure_location: string;
  arrival_location: string;
  operator: string;
  passenger_count: number;
  route?: {
    from: string;
    to: string;
    operator: string;
  };
  seat_numbers?: string[];
  vehicle_type?: string;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  qr_code?: string;
  created_at: string;
}

// Mock data
const mockEventBookings: Booking[] = [
  {
    id: '1',
    booking_reference: 'FMP-2025-001234',
    event: {
      id: '1',
      title: 'Full Moon Party',
      start_datetime: '2025-01-13T20:00:00Z',
      venue: 'Haad Rin Beach',
      location_details: {
        address: 'Haad Rin Beach, Koh Phangan, Thailand'
      }
    },
    ticket_type: {
      name: 'VIP Experience',
      includes: ['Premium Area Access', 'Welcome Drink', 'Priority Entry', 'Lounge Access']
    },
    quantity: 2,
    total_amount: 2400,
    currency: '฿',
    payment_status: 'paid',
    check_in_status: 'pending',
    created_at: '2025-01-01T10:30:00Z'
  }
];

const mockTransportBookings: TransportBooking[] = [
  {
    id: '1',
    booking_reference: 'FERRY-2025-005678',
    departure_datetime: '2025-01-12T08:30:00Z',
    arrival_datetime: '2025-01-12T10:00:00Z',
    departure_location: 'Surat Thani Pier',
    arrival_location: 'Thong Sala Pier, Koh Phangan',
    operator: 'Seatran Ferry',
    passenger_count: 2,
    total_amount: 800,
    currency: '฿',
    payment_status: 'paid',
    booking_status: 'confirmed',
    created_at: '2025-01-01T10:45:00Z'
  }
];

export default function BookingsPage() {
  const navigate = useNavigate();
  const [eventBookings, setEventBookings] = useState<Booking[]>([]);
  const [transportBookings, setTransportBookings] = useState<TransportBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'transport'>('events');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication - in real app, this would check actual auth
    const userData = localStorage.getItem('partyUser') || JSON.stringify({
      id: '1',
      display_name: 'John Doe',
      email: 'john@example.com'
    });
    
    if (!userData) {
      navigate('/auth');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEventBookings(mockEventBookings);
    setTransportBookings(mockTransportBookings);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500',
      pending: 'bg-yellow-500',
      failed: 'bg-red-500',
      refunded: 'bg-blue-500',
      cancelled: 'bg-gray-500',
      confirmed: 'bg-green-500',
      completed: 'bg-blue-500',
      checked_in: 'bg-purple-500',
      no_show: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadTicket = (booking: Booking) => {
    // In a real app, this would generate and download a PDF ticket
    const ticketData = {
      reference: booking.booking_reference,
      event: booking.event.title,
      date: formatDate(booking.event.start_datetime),
      quantity: booking.quantity,
      type: booking.ticket_type.name
    };
    
    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${booking.booking_reference}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-white mb-4" size={48} />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-purple-200">Manage your event tickets and transport reservations</p>
        </div>

        {/* User Info */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">{user.display_name}</h2>
              <p className="text-purple-200">{user.email}</p>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{eventBookings.length + transportBookings.length}</div>
              <div className="text-purple-200 text-sm">Total Bookings</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'events' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Ticket size={16} />
              Event Tickets ({eventBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'transport' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Car size={16} />
              Transport ({transportBookings.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-white/20 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'events' ? (
              eventBookings.length > 0 ? (
                eventBookings.map((booking) => (
                  <div key={booking.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-lg">{booking.event.title}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                          </div>
                          {booking.check_in_status === 'checked_in' && (
                            <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(booking.check_in_status)}`}>
                              Checked In
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-purple-200 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{formatDate(booking.event.start_datetime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} />
                            <span>{booking.event.location_details?.address || booking.event.venue || 'Location TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket size={14} />
                            <span>{booking.quantity}x {booking.ticket_type.name}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {booking.ticket_type?.includes?.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded">
                              {item}
                            </span>
                          )) || <span className="text-purple-200 text-sm">No additional benefits</span>}
                        </div>

                        <div className="text-white font-bold">
                          Total: {booking.currency} {booking.total_amount}
                        </div>
                        <div className="text-purple-200 text-sm">
                          Ref: {booking.booking_reference}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">
                        {booking.payment_status === 'paid' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadTicket(booking)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                              <Download size={16} />
                              Download
                            </button>
                            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
                              <QrCode size={16} />
                              QR Code
                            </button>
                          </div>
                        )}

                        {booking.payment_status === 'pending' && (
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            Complete Payment
                          </button>
                        )}

                        <div className="text-right text-sm text-purple-200">
                          Booked {formatDate(booking.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Ticket className="mx-auto text-white/50 mb-4" size={64} />
                  <h3 className="text-white text-xl mb-2">No event bookings</h3>
                  <p className="text-purple-200 mb-4">Start exploring amazing parties in Koh Phangan</p>
                  <button
                    onClick={() => navigate('/events')}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Browse Events
                  </button>
                </div>
              )
            ) : (
              transportBookings.length > 0 ? (
                transportBookings.map((booking) => (
                  <div key={booking.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-lg">
                            {booking.departure_location} → {booking.arrival_location}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(booking.booking_status)}`}>
                            {booking.booking_status}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-purple-200 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{formatDate(booking.departure_datetime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>Arrives {formatDate(booking.arrival_datetime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car size={14} />
                            <span>{booking.passenger_count} passenger{booking.passenger_count > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="text-white font-bold">
                          Total: {booking.currency} {booking.total_amount}
                        </div>
                        <div className="text-purple-200 text-sm">
                          Ref: {booking.booking_reference}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">
                        {booking.payment_status === 'paid' && booking.booking_status === 'confirmed' && (
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                            <Download size={16} />
                            Download Ticket
                          </button>
                        )}

                        {booking.payment_status === 'pending' && (
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            Complete Payment
                          </button>
                        )}

                        <div className="text-right text-sm text-purple-200">
                          Booked {formatDate(booking.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Car className="mx-auto text-white/50 mb-4" size={64} />
                  <h3 className="text-white text-xl mb-2">No transport bookings</h3>
                  <p className="text-purple-200 mb-4">Book ferry or bus tickets to get around</p>
                  <button
                    onClick={() => navigate('/transport')}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Book Transport
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}