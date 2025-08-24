import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Music, 
  Users, 
  Star, 
  Clock, 
  Heart,
  Share,
  Ticket,
  DollarSign,
  MessageCircle,
  Camera,
  Zap,
  Shield,
  Coffee,
  Wifi,
  Car
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  location: string;
  coordinates: { lat: number; lng: number };
  price: number;
  vipPrice?: number;
  genre: string[];
  image: string;
  gallery: string[];
  capacity: number;
  booked: number;
  rating: number;
  reviews: number;
  organizer: {
    name: string;
    avatar: string;
    bio: string;
    verified: boolean;
  };
  lineup: {
    name: string;
    time: string;
    genre: string;
    image: string;
  }[];
  amenities: string[];
  ageLimit: number;
  dresscode?: string;
  weatherWarning?: boolean;
}

const mockEvent: Event = {
  id: '1',
  title: 'Full Moon Party',
  description: 'The legendary monthly beach party that never stops',
  longDescription: 'Experience the magic of Koh Phangan\'s most famous party! The Full Moon Party is a monthly celebration that brings together party-goers from around the world for an unforgettable night of music, dancing, and beach vibes. Starting at sunset and going until sunrise, this epic party features multiple stages with world-class DJs spinning everything from trance to techno to house music.',
  date: '2025-01-13',
  time: '20:00',
  endTime: '06:00',
  venue: 'Haad Rin Beach',
  location: 'Koh Phangan, Thailand',
  coordinates: { lat: 9.6729, lng: 100.0266 },
  price: 500,
  vipPrice: 1200,
  genre: ['Electronic', 'Trance', 'Techno', 'House'],
  image: '/api/placeholder/800/600',
  gallery: [
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400'
  ],
  capacity: 8000,
  booked: 6200,
  rating: 4.8,
  reviews: 1247,
  organizer: {
    name: 'Full Moon Events',
    avatar: '/api/placeholder/60/60',
    bio: 'Bringing you the world\'s most legendary beach parties since 1985',
    verified: true
  },
  lineup: [
    { name: 'DJ Luna', time: '20:00 - 22:00', genre: 'Progressive House', image: '/api/placeholder/100/100' },
    { name: 'Solar Eclipse', time: '22:00 - 00:00', genre: 'Trance', image: '/api/placeholder/100/100' },
    { name: 'Cosmic Beats', time: '00:00 - 02:00', genre: 'Psytrance', image: '/api/placeholder/100/100' },
    { name: 'Dawn Warrior', time: '02:00 - 06:00', genre: 'Techno', image: '/api/placeholder/100/100' }
  ],
  amenities: ['bars', 'food_stalls', 'bathrooms', 'security', 'wifi', 'parking'],
  ageLimit: 18,
  dresscode: 'Beach casual, neon colors encouraged',
  weatherWarning: false
};

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<'general' | 'vip'>('general');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setEvent(mockEvent);
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading epic party details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <p className="text-xl mb-8">The party you're looking for doesn't exist</p>
          <Link 
            to="/events"
            className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, any> = {
      bars: DollarSign,
      food_stalls: Coffee,
      bathrooms: MapPin,
      security: Shield,
      wifi: Wifi,
      parking: Car
    };
    return icons[amenity] || Zap;
  };

  const getAmenityName = (amenity: string) => {
    const names: Record<string, string> = {
      bars: 'Bars & Drinks',
      food_stalls: 'Food Stalls',
      bathrooms: 'Bathrooms',
      security: '24/7 Security',
      wifi: 'Free WiFi',
      parking: 'Parking Available'
    };
    return names[amenity] || amenity;
  };

  const TabButton = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 rounded-full font-medium transition-all ${
        activeTab === value 
          ? 'bg-purple-600 text-white' 
          : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
      }`}
    >
      {children}
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      {/* Hero Section with Image */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400" />
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Event Actions Overlay */}
        <div className="absolute top-6 right-6 flex space-x-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border-0 rounded-full transition-all"
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          <button className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border-0 text-white rounded-full transition-all">
            <Share className="h-5 w-5" />
          </button>
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {event.genre.map((g) => (
                <span key={g} className="px-3 py-1 bg-purple-600/80 text-white text-sm rounded-full">
                  {g}
                </span>
              ))}
              {event.organizer.verified && (
                <span className="px-3 py-1 bg-green-600/80 text-white text-sm rounded-full">
                  ✓ Verified Organizer
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-xl text-blue-100 mb-4">{event.description}</p>
            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{event.time} - {event.endTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details Tabs */}
            <div className="w-full">
              <div className="flex flex-wrap gap-2 mb-6">
                <TabButton value="overview">Overview</TabButton>
                <TabButton value="lineup">Lineup</TabButton>
                <TabButton value="venue">Venue</TabButton>
                <TabButton value="reviews">Reviews</TabButton>
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                    <p className="text-blue-100 leading-relaxed mb-6">{event.longDescription}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{event.booked.toLocaleString()}</div>
                        <div className="text-sm text-blue-100">Attending</div>
                      </div>
                      <div className="text-center">
                        <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{event.rating}</div>
                        <div className="text-sm text-blue-100">{event.reviews} Reviews</div>
                      </div>
                      <div className="text-center">
                        <Ticket className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{event.capacity - event.booked}</div>
                        <div className="text-sm text-blue-100">Tickets Left</div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">What's Included</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.amenities.map((amenity) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div key={amenity} className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-purple-400" />
                            <span className="text-sm">{getAmenityName(amenity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lineup' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-2">DJ Lineup</h2>
                  <p className="text-blue-100 mb-6">World-class artists performing throughout the night</p>
                  <div className="space-y-4">
                    {event.lineup.map((artist, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-white/5">
                        <div className="h-16 w-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {artist.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{artist.name}</h3>
                          <p className="text-purple-300">{artist.genre}</p>
                          <p className="text-sm text-blue-100">{artist.time}</p>
                        </div>
                        <Music className="h-6 w-6 text-purple-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'venue' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Venue Information</h2>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{event.venue}</h3>
                    <p className="text-blue-100 mb-4">{event.location}</p>
                    
                    <div className="bg-white/5 rounded-lg p-4 h-64 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p>Interactive map coming soon</p>
                        <p className="text-sm">Lat: {event.coordinates.lat}, Lng: {event.coordinates.lng}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-blue-100">Reviews system coming soon</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Current rating: {event.rating}/5 from {event.reviews} reviews
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-2">Book Your Tickets</h2>
              <p className="text-blue-100 mb-6">Secure your spot at this epic party</p>
              
              <div className="space-y-4 mb-6">
                {/* Ticket Type Selection */}
                <div className="space-y-3">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTicketType === 'general' 
                        ? 'border-purple-500 bg-purple-600/20' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => setSelectedTicketType('general')}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">General Admission</h3>
                        <p className="text-sm text-blue-100">Access to all areas</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">฿{event.price}</div>
                      </div>
                    </div>
                  </div>

                  {event.vipPrice && (
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTicketType === 'vip' 
                          ? 'border-purple-500 bg-purple-600/20' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedTicketType('vip')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">VIP Experience</h3>
                          <p className="text-sm text-blue-100">Premium area + perks</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">฿{event.vipPrice}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-4 px-6 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Book Now - ฿{selectedTicketType === 'vip' ? event.vipPrice : event.price}
                </button>

                <div className="text-center text-sm text-blue-100 space-y-1">
                  <p>✓ Instant confirmation</p>
                  <p>✓ Mobile tickets</p>
                  <p>✓ Secure payment</p>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Event Organizer</h2>
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {event.organizer.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{event.organizer.name}</h3>
                    {event.organizer.verified && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-blue-100">{event.organizer.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}