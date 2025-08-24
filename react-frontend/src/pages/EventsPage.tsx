import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Ticket
} from 'lucide-react';

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
  featured: boolean;
}

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
    organizer: 'Full Moon Events',
    featured: true
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
    organizer: 'Half Moon Productions',
    featured: true
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
    organizer: 'Sunset Collective',
    featured: false
  },
  {
    id: '4',
    title: 'Jungle Experience',
    description: 'Immersive forest party with natural acoustics',
    date: '2025-01-25',
    time: '21:00',
    venue: 'Than Sadet Forest',
    location: 'Koh Phangan, Thailand',
    price: 650,
    genre: ['Psytrance', 'Ambient', 'Progressive'],
    image: '/api/placeholder/600/400',
    capacity: 1200,
    booked: 850,
    rating: 4.7,
    organizer: 'Jungle Collective',
    featured: false
  }
];

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'popularity'>('date');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const genres = ['all', 'Electronic', 'Trance', 'Techno', 'Psytrance', 'House', 'Progressive', 'Chill', 'Ambient'];

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = selectedGenre === 'all' || 
                          event.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
      
      const matchesFeatured = !showFeaturedOnly || event.featured;
      
      return matchesSearch && matchesGenre && matchesFeatured;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'popularity':
          return (b.booked / b.capacity) - (a.booked / a.capacity);
        case 'date':
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
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
              <h1 className="text-2xl font-bold text-white">All Events</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/favorites"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Heart className="w-6 h-6 text-white" />
              </Link>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Share2 className="w-6 h-6 text-white" />
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'popularity')}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
            
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                showFeaturedOnly
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              Featured Only
            </button>
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