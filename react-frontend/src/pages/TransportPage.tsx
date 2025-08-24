import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Search, Filter, Anchor, Bus, Plane } from 'lucide-react';

interface TransportRoute {
  id: string;
  operator: string;
  vehicle_type: 'ferry' | 'speedboat' | 'bus' | 'flight';
  departure_location: string;
  arrival_location: string;
  departure_times: string[];
  duration: string;
  price: {
    adult: number;
    child?: number;
    currency: string;
  };
  capacity: number;
  availability: 'high' | 'medium' | 'low';
  amenities: string[];
  photos: string[];
  rating: number;
  reviews: number;
}

interface BookingData {
  route_id: string;
  departure_date: string;
  departure_time: string;
  passengers: {
    adults: number;
    children: number;
  };
  total_price: number;
}

// Mock transport routes data
const mockRoutes: TransportRoute[] = [
  {
    id: '1',
    operator: 'Seatran Ferry',
    vehicle_type: 'ferry',
    departure_location: 'Surat Thani Pier',
    arrival_location: 'Thong Sala Pier, Koh Phangan',
    departure_times: ['08:30', '13:30', '19:30'],
    duration: '1h 30m',
    price: {
      adult: 400,
      child: 250,
      currency: '฿'
    },
    capacity: 200,
    availability: 'high',
    amenities: ['Air Conditioning', 'Toilet', 'Snack Bar', 'Wifi'],
    photos: ['/api/placeholder/300/200'],
    rating: 4.5,
    reviews: 342
  },
  {
    id: '2',
    operator: 'Songserm Express',
    vehicle_type: 'speedboat',
    departure_location: 'Koh Samui Pier',
    arrival_location: 'Thong Sala Pier, Koh Phangan',
    departure_times: ['09:00', '12:00', '15:00', '17:00'],
    duration: '25m',
    price: {
      adult: 600,
      child: 400,
      currency: '฿'
    },
    capacity: 50,
    availability: 'medium',
    amenities: ['Life Jackets', 'Covered Seating'],
    photos: ['/api/placeholder/300/200'],
    rating: 4.2,
    reviews: 187
  },
  {
    id: '3',
    operator: 'Bangkok Airways',
    vehicle_type: 'flight',
    departure_location: 'Bangkok (BKK)',
    arrival_location: 'Koh Samui Airport (USM)',
    departure_times: ['07:30', '11:45', '16:20'],
    duration: '1h 15m',
    price: {
      adult: 3500,
      child: 2800,
      currency: '฿'
    },
    capacity: 70,
    availability: 'medium',
    amenities: ['Refreshments', 'Baggage Allowance', 'Priority Boarding'],
    photos: ['/api/placeholder/300/200'],
    rating: 4.7,
    reviews: 523
  },
  {
    id: '4',
    operator: 'Government Bus',
    vehicle_type: 'bus',
    departure_location: 'Bangkok Mo Chit',
    arrival_location: 'Surat Thani Bus Terminal',
    departure_times: ['19:00', '20:30', '21:00'],
    duration: '9h 30m',
    price: {
      adult: 450,
      child: 300,
      currency: '฿'
    },
    capacity: 45,
    availability: 'high',
    amenities: ['AC', 'Reclining Seats', 'Toilet', 'Blanket'],
    photos: ['/api/placeholder/300/200'],
    rating: 4.0,
    reviews: 156
  }
];

export default function TransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'ferry' | 'speedboat' | 'bus' | 'flight'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState({ adults: 1, children: 0 });
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    let filtered = routes;
    
    if (vehicleFilter !== 'all') {
      filtered = filtered.filter(route => route.vehicle_type === vehicleFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(route => 
        route.departure_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.arrival_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.operator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRoutes(filtered);
  }, [routes, vehicleFilter, searchTerm]);

  const fetchRoutes = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRoutes(mockRoutes);
    setFilteredRoutes(mockRoutes);
    setLoading(false);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'ferry': return <Anchor className="h-5 w-5" />;
      case 'speedboat': return <Anchor className="h-5 w-5" />;
      case 'bus': return <Bus className="h-5 w-5" />;
      case 'flight': return <Plane className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const calculateTotalPrice = (route: TransportRoute) => {
    return (route.price.adult * passengers.adults) + 
           ((route.price.child || route.price.adult) * passengers.children);
  };

  const bookTransport = (route: TransportRoute, time: string) => {
    const booking: BookingData = {
      route_id: route.id,
      departure_date: selectedDate,
      departure_time: time,
      passengers: passengers,
      total_price: calculateTotalPrice(route)
    };
    
    // In real app, this would make API call
    console.log('Booking:', booking);
    alert(`Booking confirmed for ${route.operator} on ${selectedDate} at ${time}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Transport to Koh Phangan</h1>
          <p className="text-purple-200">Find and book ferries, speedboats, buses, and flights</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search routes, operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Passengers */}
          <div className="flex gap-2">
            <select
              value={passengers.adults}
              onChange={(e) => setPassengers({...passengers, adults: parseInt(e.target.value)})}
              className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="bg-gray-800">
                  {i + 1} Adult{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
            <select
              value={passengers.children}
              onChange={(e) => setPassengers({...passengers, children: parseInt(e.target.value)})}
              className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[...Array(6)].map((_, i) => (
                <option key={i} value={i} className="bg-gray-800">
                  {i} Child{i !== 1 ? 'ren' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Type Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['all', 'ferry', 'speedboat', 'bus', 'flight'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setVehicleFilter(type)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize flex items-center gap-2 ${
                vehicleFilter === type 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
              }`}
            >
              {type !== 'all' && getVehicleIcon(type)}
              {type}
            </button>
          ))}
        </div>

        {/* Routes List */}
        <div className="space-y-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-pulse">
                <div className="flex gap-6">
                  <div className="h-24 w-32 bg-white/20 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-white/20 rounded mb-2 w-1/3"></div>
                    <div className="h-4 bg-white/20 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-white/20 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredRoutes.length > 0 ? (
            filteredRoutes.map((route) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Route Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start gap-4">
                      <div className="text-purple-400">
                        {getVehicleIcon(route.vehicle_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-lg">{route.operator}</h3>
                          <span className="px-2 py-1 bg-purple-600/50 text-purple-200 text-xs rounded-full capitalize">
                            {route.vehicle_type}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-white">
                            <MapPin className="h-4 w-4 text-purple-400" />
                            <span className="font-medium">{route.departure_location}</span>
                            <span className="text-purple-300">→</span>
                            <span className="font-medium">{route.arrival_location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-purple-200">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{route.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>Up to {route.capacity} passengers</span>
                            </div>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {route.amenities.slice(0, 4).map((amenity) => (
                            <span key={amenity} className="px-2 py-1 text-xs bg-blue-600/50 text-blue-100 rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-white font-medium">{route.rating}</span>
                          </div>
                          <span className="text-purple-200 text-sm">({route.reviews} reviews)</span>
                          <span className={`text-sm font-medium ${getAvailabilityColor(route.availability)}`}>
                            • {route.availability.charAt(0).toUpperCase() + route.availability.slice(1)} availability
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Times & Booking */}
                  <div className="lg:col-span-2">
                    <div className="text-right mb-4">
                      <div className="text-2xl font-bold text-white">
                        {route.price.currency}{calculateTotalPrice(route)}
                      </div>
                      <div className="text-purple-200 text-sm">
                        For {passengers.adults} adult{passengers.adults > 1 ? 's' : ''}
                        {passengers.children > 0 && `, ${passengers.children} child${passengers.children > 1 ? 'ren' : ''}`}
                      </div>
                    </div>

                    {/* Departure Times */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium text-sm">Departure Times:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {route.departure_times.map((time) => (
                          <button
                            key={time}
                            onClick={() => bookTransport(route, time)}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-white/50 mb-4">
                <Anchor className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-white text-xl mb-2">No routes found</h3>
              <p className="text-purple-200">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Popular Routes */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { from: 'Bangkok', to: 'Koh Phangan', price: '฿850', duration: '11h' },
              { from: 'Koh Samui', to: 'Koh Phangan', price: '฿600', duration: '25m' },
              { from: 'Surat Thani', to: 'Koh Phangan', price: '฿400', duration: '1h 30m' },
              { from: 'Koh Tao', to: 'Koh Phangan', price: '฿500', duration: '45m' }
            ].map((route, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <div className="text-white font-medium mb-2">
                  {route.from} → {route.to}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">{route.duration}</span>
                  <span className="text-green-400 font-bold">{route.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}