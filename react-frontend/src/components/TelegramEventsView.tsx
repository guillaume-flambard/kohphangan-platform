import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Music, 
  Clock, 
  Search, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Heart,
  ExternalLink,
  Hash,
  Users,
  Zap
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
    if (value && value !== 'all' && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(`${key}[]`, v.toString()));
      } else {
        queryParams.append(key, value.toString());
      }
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
    staleTime: 30000,
    refetchOnWindowFocus: false,
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
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export default function TelegramEventsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Build filters for API
  const filters = {
    ...(searchQuery && { keywords: [searchQuery] }),
    ...(selectedEventType !== 'all' && { event_type: selectedEventType }),
    ...(selectedChannel !== 'all' && { channel: selectedChannel }),
    ...(urgencyFilter !== 'all' && { urgency: urgencyFilter }),
    sort_by: 'event_date',
    sort_direction: 'asc',
    per_page: 12,
  };

  const { data: eventsData, isLoading, error, refetch } = useEvents(filters);
  const { data: statsData, isLoading: statsLoading } = useEventStats();

  const events = eventsData?.data || [];

  const eventTypes = ['all', 'party', 'festival', 'wellness', 'general'];
  const channels = ['all', 'phanganparty', 'fullmoon_parties', 'koh_phangan_events', 'phangan_island_life', 'waterfall_festivals'];
  const urgencyOptions = ['all', 'today', 'tomorrow', 'weekend', 'this_week', 'this_month'];

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      today: { text: 'TODAY', color: 'bg-red-500 text-white animate-pulse' },
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
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-800 mb-2">Failed to load events</h2>
        <p className="text-red-600 mb-4">Unable to connect to the Telegram events API</p>
        <button 
          onClick={() => refetch()}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Live Events from Telegram
            </h2>
            <p className="text-purple-100">
              Real-time events scraped from Koh Phangan Telegram channels
            </p>
          </div>
          <button 
            onClick={() => refetch()}
            className="p-3 hover:bg-white/10 rounded-full transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {statsData?.success && !statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{statsData.stats.total_events}</div>
              <div className="text-sm text-purple-100">Total Events</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-300">{statsData.stats.events_today}</div>
              <div className="text-sm text-purple-100">Today</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-300">{statsData.stats.upcoming_events}</div>
              <div className="text-sm text-purple-100">Upcoming</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-300">{Object.keys(statsData.stats.by_channel).length}</div>
              <div className="text-sm text-purple-100">Channels</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              placeholder="Search events, locations, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {eventTypes.map((eventType) => (
            <button
              key={eventType}
              onClick={() => setSelectedEventType(eventType)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedEventType === eventType 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {eventType === 'all' ? 'All Types' : eventType.charAt(0).toUpperCase() + eventType.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {urgencyOptions.map((urgency) => (
            <button
              key={urgency}
              onClick={() => setUrgencyFilter(urgency)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                urgencyFilter === urgency 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {urgency === 'all' ? 'Any Time' : urgency.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {channels.map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedChannel === channel 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {channel === 'all' ? 'All Channels' : channel.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div 
              key={event.id}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative">
                <div className={`h-32 bg-gradient-to-br ${getTypeColor(event.event_type)} flex items-center justify-center`}>
                  <div className="text-4xl">{event.emojis.type}</div>
                </div>
                
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${getUrgencyBadge(event.urgency).color}`}>
                    {getUrgencyBadge(event.urgency).text}
                  </span>
                </div>
                
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {event.formatted_event_date || 'TBD'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {event.channel.toUpperCase()}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3">
                  <span className="text-2xl">{event.emojis.location}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {event.clean_description}
                </h3>
                
                {event.has_location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.event_date_time || event.formatted_event_date || 'Time TBD'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>Posted {new Date(event.date_posted).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {event.primary_keywords.slice(0, 4).map((keyword) => (
                    <span key={keyword} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      #{keyword}
                    </span>
                  ))}
                  {event.keywords_found.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{event.keywords_found.length - 4}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.event_type === 'party' ? 'bg-pink-100 text-pink-800' :
                    event.event_type === 'festival' ? 'bg-yellow-100 text-yellow-800' :
                    event.event_type === 'wellness' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.event_type.toUpperCase()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {(event.is_today || event.is_tomorrow || event.is_this_weekend) && (
                      <span className="text-red-500 text-xs font-bold animate-pulse flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        HOT
                      </span>
                    )}
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && events.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedEventType('all');
              setSelectedChannel('all');
              setUrgencyFilter('all');
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {!isLoading && eventsData?.meta && eventsData.meta.last_page > 1 && (
        <div className="text-center bg-white rounded-lg border p-4">
          <span className="text-gray-600 text-sm">
            Showing {eventsData.meta.from}-{eventsData.meta.to} of {eventsData.meta.total} events
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Page {eventsData.meta.current_page} of {eventsData.meta.last_page}
          </div>
        </div>
      )}
    </div>
  );
}