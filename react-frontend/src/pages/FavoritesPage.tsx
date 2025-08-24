import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Users, Star, Trash2, Filter, Search } from 'lucide-react';

interface FavoriteEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  genres: string[];
  start_datetime: string;
  end_datetime: string;
  location_details: {
    address: string;
    coordinates: [number, number];
  };
  capacity: number;
  pricing: Array<{
    type: string;
    price: number;
    currency: string;
  }>;
  photos: string[];
  is_featured: boolean;
  venue?: {
    name: string;
    venue_type: string;
  };
  organizer?: {
    name: string;
    verification_status: string;
  };
  favorited_at: string;
}

interface FavoriteVenue {
  id: string;
  name: string;
  venue_type: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  capacity: number;
  facilities: string[];
  photos: string[];
  favorited_at: string;
}

interface FavoriteOrganizer {
  id: string;
  name: string;
  description: string;
  verification_status: string;
  reputation_score: number;
  total_events: number;
  specialties: string[];
  photos: string[];
  favorited_at: string;
}

// Mock data
const mockFavoriteEvents: FavoriteEvent[] = [
  {
    id: '1',
    title: 'Full Moon Party',
    description: 'The legendary monthly beach party',
    event_type: 'full_moon',
    genres: ['Electronic', 'Trance', 'Techno'],
    start_datetime: '2025-01-13T20:00:00Z',
    end_datetime: '2025-01-14T06:00:00Z',
    location_details: {
      address: 'Haad Rin Beach, Koh Phangan',
      coordinates: [9.6729, 100.0266]
    },
    capacity: 8000,
    pricing: [
      { type: 'General', price: 500, currency: '฿' },
      { type: 'VIP', price: 1200, currency: '฿' }
    ],
    photos: ['/api/placeholder/400/300'],
    is_featured: true,
    venue: {
      name: 'Haad Rin Beach',
      venue_type: 'beach'
    },
    organizer: {
      name: 'Full Moon Events',
      verification_status: 'verified'
    },
    favorited_at: '2025-01-01T10:00:00Z'
  }
];

const mockFavoriteVenues: FavoriteVenue[] = [
  {
    id: '1',
    name: 'Haad Rin Beach',
    venue_type: 'beach',
    location: {
      address: 'Haad Rin, Koh Phangan, Thailand',
      coordinates: [9.6729, 100.0266]
    },
    capacity: 10000,
    facilities: ['Sound System', 'Bar Areas', 'Security', 'Toilets'],
    photos: ['/api/placeholder/400/300'],
    favorited_at: '2025-01-01T10:00:00Z'
  }
];

const mockFavoriteOrganizers: FavoriteOrganizer[] = [
  {
    id: '1',
    name: 'Full Moon Events',
    description: 'Premier party organizers in Koh Phangan since 1985',
    verification_status: 'verified',
    reputation_score: 95,
    total_events: 240,
    specialties: ['Full Moon Parties', 'Beach Events', 'Electronic Music'],
    photos: ['/api/placeholder/400/300'],
    favorited_at: '2025-01-01T10:00:00Z'
  }
];

export default function FavoritesPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [favoriteVenues, setFavoriteVenues] = useState<FavoriteVenue[]>([]);
  const [favoriteOrganizers, setFavoriteOrganizers] = useState<FavoriteOrganizer[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'venues' | 'organizers'>('events');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setFavoriteEvents(mockFavoriteEvents);
    setFavoriteVenues(mockFavoriteVenues);
    setFavoriteOrganizers(mockFavoriteOrganizers);
    setLoading(false);
  };

  const removeFavorite = async (id: string, type: 'events' | 'venues' | 'organizers') => {
    if (type === 'events') {
      setFavoriteEvents(prev => prev.filter(item => item.id !== id));
    } else if (type === 'venues') {
      setFavoriteVenues(prev => prev.filter(item => item.id !== id));
    } else {
      setFavoriteOrganizers(prev => prev.filter(item => item.id !== id));
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      full_moon: 'bg-yellow-500',
      half_moon: 'bg-blue-500',
      black_moon: 'bg-purple-900',
      beach_party: 'bg-cyan-500',
      jungle_party: 'bg-green-500',
      sunset_session: 'bg-orange-500'
    };
    return colors[type] || 'bg-purple-500';
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

  const filteredEvents = favoriteEvents.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVenues = favoriteVenues.filter(venue => 
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganizers = favoriteOrganizers.filter(organizer => 
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">My Favorites</h1>
          <p className="text-purple-200">Your saved events, venues, and organizers</p>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'events' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart size={16} />
              Events ({favoriteEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'venues' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <MapPin size={16} />
              Venues ({favoriteVenues.length})
            </button>
            <button
              onClick={() => setActiveTab('organizers')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'organizers' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Users size={16} />
              Organizers ({favoriteOrganizers.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-24 w-32 bg-white/20 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-white/20 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-white/20 rounded mb-2 w-1/2"></div>
                      <div className="h-4 bg-white/20 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div key={activeTab}>
              {activeTab === 'events' && (
                <div className="space-y-6">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
                      >
                        <div className="flex gap-4">
                          <div className="h-24 w-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-white font-bold text-lg">{event.title}</h3>
                                <p className="text-purple-200 text-sm">{event.description}</p>
                              </div>
                              <button
                                onClick={() => removeFavorite(event.id, 'events')}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-2 py-1 rounded-full text-xs text-white ${getEventTypeColor(event.event_type)}`}>
                                {event.event_type.replace('_', ' ').toUpperCase()}
                              </span>
                              {event.is_featured && (
                                <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">FEATURED</span>
                              )}
                              {event.organizer?.verification_status === 'verified' && (
                                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">✓ VERIFIED</span>
                              )}
                            </div>

                            <div className="space-y-1 text-sm text-purple-200 mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>{formatDate(event.start_datetime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                <span>{event.venue?.name || event.location_details.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={14} />
                                <span>Capacity: {event.capacity.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {event.genres.slice(0, 3).map((genre) => (
                                <span key={genre} className="px-2 py-1 text-xs bg-purple-600/50 text-purple-100 rounded">
                                  {genre}
                                </span>
                              ))}
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="text-white">
                                <span className="font-bold text-lg">
                                  {event.pricing[0]?.currency} {event.pricing[0]?.price}
                                </span>
                                <span className="text-purple-200 text-sm ml-2">
                                  Favorited {formatDate(event.favorited_at)}
                                </span>
                              </div>
                              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="mx-auto text-white/50 mb-4" size={64} />
                      <h3 className="text-white text-xl mb-2">No favorite events</h3>
                      <p className="text-purple-200 mb-4">Start exploring and save events you love</p>
                      <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        Browse Events
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'venues' && (
                <div className="space-y-6">
                  {filteredVenues.length > 0 ? (
                    filteredVenues.map((venue) => (
                      <motion.div
                        key={venue.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
                      >
                        <div className="flex gap-4">
                          <div className="h-24 w-32 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-white font-bold text-lg">{venue.name}</h3>
                                <p className="text-purple-200 text-sm">{venue.venue_type.replace('_', ' ').toUpperCase()}</p>
                              </div>
                              <button
                                onClick={() => removeFavorite(venue.id, 'venues')}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="space-y-1 text-sm text-purple-200 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                <span>{venue.location.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={14} />
                                <span>Capacity: {venue.capacity.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {venue.facilities.slice(0, 4).map((facility) => (
                                <span key={facility} className="px-2 py-1 text-xs bg-cyan-600/50 text-cyan-100 rounded">
                                  {facility}
                                </span>
                              ))}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-purple-200 text-sm">
                                Favorited {formatDate(venue.favorited_at)}
                              </span>
                              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="mx-auto text-white/50 mb-4" size={64} />
                      <h3 className="text-white text-xl mb-2">No favorite venues</h3>
                      <p className="text-purple-200 mb-4">Save your favorite party spots</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'organizers' && (
                <div className="space-y-6">
                  {filteredOrganizers.length > 0 ? (
                    filteredOrganizers.map((organizer) => (
                      <motion.div
                        key={organizer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
                      >
                        <div className="flex gap-4">
                          <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {organizer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white font-bold text-lg">{organizer.name}</h3>
                                  {organizer.verification_status === 'verified' && (
                                    <span className="text-green-400 text-sm">✓</span>
                                  )}
                                </div>
                                <p className="text-purple-200 text-sm">{organizer.description}</p>
                              </div>
                              <button
                                onClick={() => removeFavorite(organizer.id, 'organizers')}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-white text-sm">{organizer.reputation_score}%</span>
                              </div>
                              <div className="text-purple-200 text-sm">
                                {organizer.total_events} events organized
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {organizer.specialties.slice(0, 3).map((specialty) => (
                                <span key={specialty} className="px-2 py-1 text-xs bg-green-600/50 text-green-100 rounded">
                                  {specialty}
                                </span>
                              ))}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-purple-200 text-sm">
                                Favorited {formatDate(organizer.favorited_at)}
                              </span>
                              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                View Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users className="mx-auto text-white/50 mb-4" size={64} />
                      <h3 className="text-white text-xl mb-2">No favorite organizers</h3>
                      <p className="text-purple-200 mb-4">Follow amazing event organizers</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}