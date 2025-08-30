import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Music, 
  Users, 
  Star, 
  Clock, 
  Search, 
  Filter,
  ArrowLeft,
  Heart,
  Share2,
  Ticket,
  AlertCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

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
const API_BASE_URL = 'http://localhost:8000/api';

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
      const response = await fetch(`${API_BASE_URL}/events?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });
};

const useEventStats = () => {
  return useQuery<EventStats>({
    queryKey: ['eventStats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/events/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch event stats');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
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

  const events = eventsData?.data || [];
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
            <Link key={event.id} to={`/events/${event.id}`}>
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 group-hover:scale-105 transition-transform duration-300" />
                  
                  {event.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                        FEATURED
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-black/50 text-white border-0 rounded text-sm">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-white font-medium">{event.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold group-hover:text-purple-300 transition-colors mb-2">
                    {event.title}
                  </h3>
                  <p className="text-blue-100 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                      <Users className="h-4 w-4" />
                      {event.booked}/{event.capacity} attending
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.genre.slice(0, 2).map((g) => (
                      <span key={g} className="px-2 py-1 text-xs bg-purple-600/50 text-purple-100 border border-purple-400/30 rounded">
                        {g}
                      </span>
                    ))}
                    {event.genre.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-purple-600/50 text-purple-100 border border-purple-400/30 rounded">
                        +{event.genre.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-purple-300">
                      ฿{event.price}
                    </span>
                    <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-6 py-2 font-medium transition-all duration-200 flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </Link>
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
    </motion.div>
  );
}