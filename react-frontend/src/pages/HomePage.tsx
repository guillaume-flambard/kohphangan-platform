import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Music, Users, Star, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price: number;
  genre: string[];
  image: string;
  capacity: number;
  booked: number;
  rating: number;
  organizer: string;
}

// Mock data for initial development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Full Moon Party',
    description: 'The legendary monthly beach party that never stops',
    date: '2025-01-13',
    time: '20:00',
    venue: 'Haad Rin Beach',
    location: 'Koh Phangan, Thailand',
    price: 500,
    genre: ['Electronic', 'Trance', 'Techno'],
    image: '/api/placeholder/600/400',
    capacity: 8000,
    booked: 6200,
    rating: 4.8,
    organizer: 'Full Moon Events'
  },
  {
    id: '2',
    title: 'Half Moon Festival',
    description: 'Jungle party with world-class DJs in the heart of the island',
    date: '2025-01-20',
    time: '22:00',
    venue: 'Ban Tai Jungle',
    location: 'Koh Phangan, Thailand',
    price: 800,
    genre: ['Psytrance', 'Progressive', 'Techno'],
    image: '/api/placeholder/600/400',
    capacity: 3000,
    booked: 2100,
    rating: 4.9,
    organizer: 'Half Moon Productions'
  },
  {
    id: '3',
    title: 'Sunset Beach Vibes',
    description: 'Chill sunset sessions with house music and cocktails',
    date: '2025-01-18',
    time: '16:00',
    venue: 'Secret Beach',
    location: 'Koh Phangan, Thailand',
    price: 300,
    genre: ['House', 'Deep House', 'Chill'],
    image: '/api/placeholder/600/400',
    capacity: 500,
    booked: 320,
    rating: 4.6,
    organizer: 'Sunset Collective'
  }
];

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = ['all', 'Electronic', 'Trance', 'Techno', 'Psytrance', 'House', 'Progressive', 'Chill'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === 'all' || 
                        event.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
    
    return matchesSearch && matchesGenre;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('/api/placeholder/1920/1080')"
          }}
        />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 py-16 max-w-7xl"
        >
          <div className="text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
            >
              Koh Phangan
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl mb-8 text-blue-100"
            >
              Paradise Island Parties • Book Your Experience
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  placeholder="Search events, venues, or DJs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-300 rounded-full h-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-8 h-12 font-medium transition-all duration-200"
              >
                Find Parties
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Genre Filter */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-wrap gap-2 justify-center">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
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
      <div className="container mx-auto px-4 pb-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 group-hover:scale-105 transition-transform duration-300" />
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
                  <p className="text-blue-100 mb-4">
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
                    {(event.genre || []).slice(0, 2).map((g) => (
                      <span key={g} className="px-2 py-1 text-xs bg-purple-600/50 text-purple-100 border border-purple-400/30 rounded">
                        {g}
                      </span>
                    ))}
                    {(event.genre || []).length > 2 && (
                      <span className="px-2 py-1 text-xs bg-purple-600/50 text-purple-100 border border-purple-400/30 rounded">
                        +{(event.genre || []).length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-purple-300">
                      ฿{event.price}
                    </span>
                    <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-6 py-2 font-medium transition-all duration-200">
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-blue-100">Try adjusting your search or genre filter</p>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-black/20 backdrop-blur-md border-t border-white/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <Link to="/auth" className="group">
              <div className="p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white">Join the Community</h3>
                <p className="text-blue-100 text-sm">Connect with party lovers</p>
              </div>
            </Link>
            
            <Link to="/organizer" className="group">
              <div className="p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Calendar className="h-8 w-8 text-pink-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white">Host an Event</h3>
                <p className="text-blue-100 text-sm">Create amazing parties</p>
              </div>
            </Link>
            
            <Link to="/guide" className="group">
              <div className="p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white">Island Guide</h3>
                <p className="text-blue-100 text-sm">Explore Koh Phangan</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}