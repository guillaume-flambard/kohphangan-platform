import {useEffect, useState} from 'react'; // <-- FIX: Added useEffect
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {useQuery} from '@tanstack/react-query';
import OmisePaymentWidget from '../components/OmisePaymentWidget';
import {AlertCircle, ArrowLeft, Clock, MapPin, Music, RefreshCw, Search, Ticket, TrendingUp} from 'lucide-react';

// API Types based on our Laravel API
interface ScrapedEvent {
  id: number;
  channel: string;
  description: string;
  clean_description: string;
  event_type: 'party' | 'festival' | 'wellness' | 'general';
  event_date: string | null;
  formatted_event_date: string | null;
  event_date_time: string | null;
  location: string | null;
  has_location: boolean;
  keywords_found: string[];
  primary_keywords: string[];
  urls: string[];
  mentions: string[];
  urgency: string;
  is_today: boolean;
  is_tomorrow: boolean;
  is_this_weekend: boolean;
  emojis: {
    type: string;
    location: string;
  };
  date_posted: string;
  created_at: string;
  updated_at: string;
}

interface EventsResponse {
  data: ScrapedEvent[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

interface EventStats {
  success: boolean;
  stats: {
    total_events: number;
    by_type: Record<string, number>;
    by_channel: Record<string, number>;
    recent_events: number;
    upcoming_events: number;
    events_today: number;
    events_this_week: number;
  };
  popular_locations: Record<string, number>;
  trending_keywords: Record<string, number>;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Custom hooks for API calls
const useEvents = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      queryParams.append(key, value.toString());
    }
  });

  return useQuery<EventsResponse>({
    queryKey: ['events', filters],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(`${API_BASE_URL}/api/events?${queryParams.toString()}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if ((error as Error).name === 'AbortError') {
          throw new Error('Request timeout - API is taking too long to respond');
        }
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once
    retryDelay: 2000, // Wait 2 seconds between retries
  });
};

const useEventStats = () => {
  return useQuery<EventStats>({
    queryKey: ['eventStats'],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        const response = await fetch(`${API_BASE_URL}/api/events/stats`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Stats API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if ((error as Error).name === 'AbortError') {
          throw new Error('Stats timeout - API is taking too long to respond');
        }
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    retry: 1, // Only retry once
    retryDelay: 2000, // Wait 2 seconds between retries
  });
};

export default function EventsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'event_date' | 'date_posted' | 'created_at'>('event_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<ScrapedEvent | null>(null);

  // --- START: Corrected Payment State ---
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string>('');
  const [pollingChargeId, setPollingChargeId] = useState<string | null>(null);
  // --- END: Corrected Payment State ---

  // Build filters for API
  const filters = {
    ...(searchQuery && { keywords: [searchQuery] }),
    ...(selectedEventType !== 'all' && { event_type: selectedEventType }),
    ...(selectedChannel !== 'all' && { channel: selectedChannel }),
    ...(urgencyFilter !== 'all' && { urgency: urgencyFilter }),
    sort_by: sortBy,
    sort_direction: sortDirection,
    per_page: 12,
  };

  const { data: eventsData, isLoading, error, refetch } = useEvents(filters);
  const { data: statsData } = useEventStats();

  const eventTypes = ['all', 'party', 'festival', 'wellness', 'general'];
  const channels = ['all', 'phanganparty', 'fullmoon_parties', 'koh_phangan_events', 'phangan_island_life', 'waterfall_festivals'];
  const urgencyOptions = ['all', 'today', 'tomorrow', 'weekend', 'this_week', 'this_month', 'future'];

  // Deduplicate events by clean_description and event_date
  const events = eventsData?.data || [];
  const uniqueEvents = events.filter((event, index, self) =>
      index === self.findIndex(e =>
        e.clean_description === event.clean_description &&
        e.event_date === event.event_date
      )
  );
  const meta = eventsData?.meta;

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      today: { text: 'TODAY', color: 'bg-red-500 text-white' },
      tomorrow: { text: 'TOMORROW', color: 'bg-orange-500 text-white' },
      weekend: { text: 'THIS WEEKEND', color: 'bg-blue-500 text-white' },
      this_week: { text: 'THIS WEEK', color: 'bg-green-500 text-white' },
      this_month: { text: 'THIS MONTH', color: 'bg-purple-500 text-white' },
      future: { text: 'UPCOMING', color: 'bg-gray-500 text-white' },
    };
    return badges[urgency as keyof typeof badges] || { text: 'TBD', color: 'bg-gray-400 text-white' };
  };

  const getTypeColor = (eventType: string) => {
    const colors = {
      party: 'from-pink-500 to-purple-600',
      festival: 'from-yellow-400 to-orange-500',
      wellness: 'from-green-400 to-blue-500',
      general: 'from-gray-400 to-gray-600',
    };
    return colors[eventType as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  // Format date function
  const formatDate = (date: string | null) => {
    if (!date) return 'TBD';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  // Generate genres from scraped events data
  const genres = ['all', ...new Set(uniqueEvents.flatMap(event => event.primary_keywords || []))].slice(0, 10);

  // Mock events for payment testing when API is slow or empty
  const mockEvents: ScrapedEvent[] = [
    {
      id: 999,
      channel: 'waterfall_test',
      description: 'Waterfall Festival Echo - Final Party 2025',
      clean_description: 'Waterfall Festival Echo - The ultimate jungle rave experience with 4 stages and sunrise sets',
      event_type: 'festival' as const,
      event_date: '2025-09-15',
      formatted_event_date: 'Saturday, Sep 15, 2025 at 8:00 PM',
      event_date_time: '2025-09-15T20:00:00Z',
      location: 'Secret Waterfall, Koh Phangan',
      has_location: true,
      keywords_found: ['waterfall', 'festival', 'jungle', 'rave'],
      primary_keywords: ['festival', 'jungle', 'rave'],
      urls: [],
      mentions: [],
      urgency: 'this_month',
      is_today: false,
      is_tomorrow: false,
      is_this_weekend: false,
      emojis: { type: '🎵', location: '🏝️' },
      date_posted: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  // Use mock events if no real events available
  const eventsToShow = uniqueEvents.length > 0 ? uniqueEvents : mockEvents;

  // Filter and sort events
  const filteredAndSortedEvents = eventsToShow.filter(event => {
    if (selectedGenre !== 'all' && !event.primary_keywords?.includes(selectedGenre)) return false;
    if (showFeaturedOnly && !event.is_today && !event.is_tomorrow && !event.is_this_weekend) return false;
    return true;
  });

  // Handle payment modal
  const handleBuyTicket = (event: ScrapedEvent, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setSelectedEventForPayment(event);
    setShowPaymentModal(true);
  };

  // --- START: Corrected Payment Handlers ---
  useEffect(() => {
    if (paymentStatus !== 'pending' || !pollingChargeId) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/omise/payment/charge/${pollingChargeId}/status`);
        const data = await response.json();

        if (data.success && data.status === 'completed') {
          handlePaymentSuccess({ tickets: data.tickets });
          setPollingChargeId(null); // Stop polling
        } else if (!data.success) {
          handlePaymentError('Could not verify payment status.');
          setPollingChargeId(null);
        }
      } catch (err) {
        console.error("Polling error:", err);
        handlePaymentError('Network error while verifying payment.');
        setPollingChargeId(null);
      }
    }, 3000); // Check every 3 seconds

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if(paymentStatus === 'pending') {
        handlePaymentError('Payment confirmation timed out. Please check your email.');
        setPollingChargeId(null);
      }
    }, 120000); // Stop polling after 2 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentStatus, pollingChargeId]);

  const handleInitialChargeResponse = (chargeData: any) => {
    if (chargeData.status === 'successful') {
      handlePaymentSuccess(chargeData);
    } else if (chargeData.status === 'pending') {
      setPaymentStatus('pending');
      setPaymentMessage(chargeData.message || 'Waiting for payment confirmation...');
      setPollingChargeId(chargeData.charge_id);
    } else {
      handlePaymentError(chargeData.error || 'Payment failed.');
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setPaymentStatus('success');
    setPaymentMessage(`Payment successful! ${paymentData.tickets?.length || 1} ticket(s) purchased.`);
    setPollingChargeId(null); // Ensure polling stops

    setTimeout(() => {
      setShowPaymentModal(false);
      setSelectedEventForPayment(null);
      setPaymentStatus('idle');
      setPaymentMessage('');
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
    setPaymentMessage(error);
    setPollingChargeId(null); // Ensure polling stops

    setTimeout(() => {
      setPaymentStatus('idle');
      setPaymentMessage('');
    }, 5000);
  };
  // --- END: Corrected Payment Handlers ---

  // Convert ScrapedEvent to EventDetails for payment widget
  const convertToEventDetails = (event: ScrapedEvent) => ({
    name: event.clean_description.substring(0, 60),
    date: event.formatted_event_date || formatDate(event.event_date),
    time: '8:00 PM - 6:00 AM',
    location: event.location || 'Koh Phangan',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
    description: event.clean_description,
    price: event.event_type === 'festival' ? 1500 : event.event_type === 'party' ? 800 : 600,
  });

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Failed to load events</h2>
          <p className="text-blue-100 mb-4">Unable to connect to the events API</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Live Events</h1>
                {statsData?.success && (
                  <p className="text-sm text-blue-200">
                    {statsData.stats.total_events} events from Telegram channels
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {statsData?.success && (
                <div className="hidden sm:flex items-center space-x-4 text-sm text-blue-200">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {statsData.stats.events_today} today
                  </div>
                  <div>
                    {statsData.stats.upcoming_events} upcoming
                  </div>
                </div>
              )}
              <button
                onClick={() => refetch()}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`w-6 h-6 text-white ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                placeholder="Search events, venues, or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Channels</option>
              {channels.slice(1).map((channel) => (
                <option key={channel} value={channel}>
                  {channel.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'event_date' | 'date_posted' | 'created_at')}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="event_date">Sort by Event Date</option>
              <option value="date_posted">Sort by Posted Date</option>
              <option value="created_at">Sort by Discovery</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                }`}
              >
                {genre === 'all' ? 'All Genres' : genre}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedEvents.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 group-hover:scale-105 transition-transform duration-300" />

                {(event.is_today || event.is_tomorrow) && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                      URGENT
                    </span>
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-black/50 text-white border-0 rounded text-sm">
                    {formatDate(event.event_date)}
                  </span>
                </div>

                {(event.is_today || event.is_tomorrow || event.is_this_weekend) && (
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getUrgencyBadge(event.urgency).color}`}>
                      {getUrgencyBadge(event.urgency).text}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold group-hover:text-purple-300 transition-colors mb-2">
                  {event.clean_description.substring(0, 50)}...
                </h3>
                <p className="text-blue-100 mb-4 line-clamp-2">
                  {event.clean_description}
                </p>

                <div className="space-y-2 mb-4">
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <Clock className="h-4 w-4" />
                    {event.formatted_event_date || 'Time TBD'}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <Music className="h-4 w-4" />
                    {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {event.primary_keywords?.slice(0, 2).map((keyword) => (
                    <span key={keyword} className="px-2 py-1 text-xs bg-purple-600/50 text-purple-100 border border-purple-400/30 rounded">
                      {keyword}
                    </span>
                  ))}
                  {event.primary_keywords && event.primary_keywords.length > 2 && (
                    <span className="px-2 py-1 text-xs bg-purple-600/50 text-purple-100 border border-purple-400/30 rounded">
                      +{event.primary_keywords.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-300">From {event.channel}</span>
                    <span className="text-lg font-bold text-green-400">
                      ฿{convertToEventDetails(event).price}
                    </span>
                  </div>
                  <motion.button
                    onClick={(e) => handleBuyTicket(event, e)}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-full px-6 py-2 font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Ticket className="w-4 h-4" />
                    Buy Ticket
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-blue-100 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setShowFeaturedOnly(false);
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredAndSortedEvents.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full font-medium transition-all">
              Load More Events
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedEventForPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowPaymentModal(false);
              setSelectedEventForPayment(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedEventForPayment(null);
                    setPaymentStatus('idle');
                    setPaymentMessage('');
                  }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 border border-white/20"
                >
                  ×
                </motion.button>

                {/* --- START: Corrected Overlay Logic --- */}
                <AnimatePresence>
                  {paymentStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex items-center justify-center z-20"
                    >
                      {paymentStatus === 'pending' ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center p-8 rounded-2xl bg-blue-500/20 border border-blue-500/30"
                        >
                          <RefreshCw className="h-16 w-16 text-blue-300 mx-auto mb-4 animate-spin" />
                          <h3 className="text-xl font-bold mb-2 text-blue-100">
                            Payment Pending
                          </h3>
                          <p className="text-white text-sm">{paymentMessage}</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`text-center p-8 rounded-2xl ${
                            paymentStatus === 'success'
                              ? 'bg-green-500/20 border border-green-500/30'
                              : 'bg-red-500/20 border border-red-500/30'
                          }`}
                        >
                          <div className={`text-6xl mb-4 ${
                            paymentStatus === 'success' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {paymentStatus === 'success' ? '✅' : '❌'}
                          </div>
                          <h3 className={`text-xl font-bold mb-2 ${
                            paymentStatus === 'success' ? 'text-green-100' : 'text-red-100'
                          }`}>
                            {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Error'}
                          </h3>
                          <p className="text-white text-sm">{paymentMessage}</p>
                          {paymentStatus === 'success' && (
                            <p className="text-green-200 text-xs mt-2">
                              This modal will close automatically...
                            </p>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* --- END: Corrected Overlay Logic --- */}

                <OmisePaymentWidget
                  eventDetails={convertToEventDetails(selectedEventForPayment)}
                  onSuccess={handleInitialChargeResponse}
                  onError={handlePaymentError}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

