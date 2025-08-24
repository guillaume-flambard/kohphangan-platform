import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Filter, Search, Star, Clock, Calendar, Users } from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  type: 'venue' | 'event' | 'transport' | 'accommodation';
  coordinates: [number, number];
  address: string;
  rating?: number;
  description: string;
  photos: string[];
  isOpen?: boolean;
  openingHours?: string;
  priceRange?: string;
  capacity?: number;
  upcomingEvents?: number;
}

// Mock data for map locations
const mockLocations: MapLocation[] = [
  {
    id: '1',
    name: 'Haad Rin Beach',
    type: 'venue',
    coordinates: [9.6729, 100.0266],
    address: 'Haad Rin, Koh Phangan, Thailand',
    rating: 4.8,
    description: 'Famous beach venue hosting the legendary Full Moon Party',
    photos: ['/api/placeholder/300/200'],
    isOpen: true,
    openingHours: '24/7',
    priceRange: '฿500-1500',
    capacity: 8000,
    upcomingEvents: 3
  },
  {
    id: '2',
    name: 'Secret Beach Party',
    type: 'event',
    coordinates: [9.7129, 100.0166],
    address: 'Secret Beach, Koh Phangan, Thailand',
    rating: 4.6,
    description: 'Intimate sunset party with electronic beats',
    photos: ['/api/placeholder/300/200'],
    isOpen: true,
    priceRange: '฿300-800',
    capacity: 500,
    upcomingEvents: 1
  },
  {
    id: '3',
    name: 'Thong Sala Pier',
    type: 'transport',
    coordinates: [9.7329, 100.0066],
    address: 'Thong Sala, Koh Phangan, Thailand',
    description: 'Main ferry terminal connecting to mainland and other islands',
    photos: ['/api/placeholder/300/200'],
    isOpen: true,
    openingHours: '5:00 AM - 8:00 PM'
  },
  {
    id: '4',
    name: 'Jungle Experience Lodge',
    type: 'accommodation',
    coordinates: [9.6929, 99.9966],
    address: 'Jungle Area, Koh Phangan, Thailand',
    rating: 4.5,
    description: 'Eco-friendly accommodation in the heart of nature',
    photos: ['/api/placeholder/300/200'],
    priceRange: '฿800-2000'
  }
];

export default function MapPage() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [filter, setFilter] = useState<'all' | 'venue' | 'event' | 'transport' | 'accommodation'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, [filter]);

  const fetchLocations = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const filteredLocations = filter === 'all' 
      ? mockLocations 
      : mockLocations.filter(location => location.type === filter);
    
    setLocations(filteredLocations);
    setLoading(false);
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'venue': return '🏖️';
      case 'event': return '🎉';
      case 'transport': return '⛴️';
      case 'accommodation': return '🏨';
      default: return '📍';
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'venue': return 'border-cyan-500 bg-cyan-500/20';
      case 'event': return 'border-purple-500 bg-purple-500/20';
      case 'transport': return 'border-green-500 bg-green-500/20';
      case 'accommodation': return 'border-orange-500 bg-orange-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-1/3 bg-white/10 backdrop-blur-md border-r border-white/20 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Island Map</h1>
              <p className="text-purple-200">Discover venues, events, and more</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Filter by Type</h3>
              <div className="flex flex-wrap gap-2">
                {(['all', 'venue', 'event', 'transport', 'accommodation'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                      filter === filterType 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                    }`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations List */}
            <div className="space-y-3">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-lg p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-white/20 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredLocations.map((location) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white/10 backdrop-blur-md border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-white/20 ${
                      selectedLocation?.id === location.id 
                        ? getLocationColor(location.type)
                        : 'border-white/20'
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getLocationIcon(location.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{location.name}</h3>
                        <p className="text-purple-200 text-sm mb-2">{location.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-purple-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="capitalize">{location.type}</span>
                          </div>
                          {location.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span>{location.rating}</span>
                            </div>
                          )}
                          {location.upcomingEvents && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{location.upcomingEvents} events</span>
                            </div>
                          )}
                        </div>

                        {location.priceRange && (
                          <div className="mt-2">
                            <span className="text-green-400 font-semibold text-sm">
                              {location.priceRange}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Map Placeholder */}
          <div className="h-full bg-gradient-to-br from-blue-500 to-green-500 relative overflow-hidden">
            {/* Decorative island shape */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Island outline */}
                <div className="w-96 h-64 bg-green-600/30 rounded-full transform rotate-12 backdrop-blur-sm"></div>
                <div className="absolute top-8 left-12 w-32 h-20 bg-green-500/40 rounded-full"></div>
                <div className="absolute bottom-8 right-12 w-24 h-16 bg-green-400/30 rounded-full"></div>
                
                {/* Location pins */}
                {filteredLocations.map((location, index) => (
                  <motion.div
                    key={location.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedLocation?.id === location.id ? 'scale-125 z-10' : 'hover:scale-110'
                    }`}
                    style={{
                      left: `${20 + (index % 3) * 30}%`,
                      top: `${30 + Math.floor(index / 3) * 25}%`
                    }}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xl backdrop-blur-md ${
                      selectedLocation?.id === location.id 
                        ? getLocationColor(location.type)
                        : 'border-white/50 bg-white/20'
                    }`}>
                      {getLocationIcon(location.type)}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        {location.name}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Map coming soon overlay */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2">
                <p className="text-white text-sm">🗺️ Interactive map coming soon</p>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span>🏖️</span> <span>Venues</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span>🎉</span> <span>Events</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span>⛴️</span> <span>Transport</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span>🏨</span> <span>Hotels</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details Panel */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 right-6 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedLocation.name}</h3>
                  <p className="text-purple-200 text-sm capitalize">{selectedLocation.type}</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4"></div>

              <p className="text-white mb-4">{selectedLocation.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-purple-200">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedLocation.address}</span>
                </div>
                
                {selectedLocation.rating && (
                  <div className="flex items-center gap-2 text-purple-200">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{selectedLocation.rating}/5</span>
                  </div>
                )}

                {selectedLocation.openingHours && (
                  <div className="flex items-center gap-2 text-purple-200">
                    <Clock className="h-4 w-4" />
                    <span>{selectedLocation.openingHours}</span>
                  </div>
                )}

                {selectedLocation.capacity && (
                  <div className="flex items-center gap-2 text-purple-200">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {selectedLocation.capacity.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedLocation.priceRange && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <span className="text-green-400 font-semibold">
                    Price Range: {selectedLocation.priceRange}
                  </span>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Get Directions
                </button>
                {selectedLocation.type === 'venue' && (
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    View Events
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}