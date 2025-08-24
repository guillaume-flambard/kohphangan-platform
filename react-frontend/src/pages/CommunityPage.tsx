import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Heart, Star, Calendar, MapPin, Trophy, Camera, Share2, Filter } from 'lucide-react';

interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  party_karma_score: number;
  total_events_attended: number;
  verification_status: 'verified' | 'pending' | 'unverified';
  location?: string;
}

interface Post {
  id: string;
  user: User;
  content: string;
  photos: string[];
  event?: {
    id: string;
    title: string;
    start_datetime: string;
  };
  venue?: {
    id: string;
    name: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  post_type: 'text' | 'photo' | 'event_checkin' | 'venue_review';
}

interface LeaderboardUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  party_karma_score: number;
  total_events_attended: number;
  rank: number;
}

// Mock data
const mockUser: User = {
  id: '1',
  display_name: 'John Doe',
  avatar_url: '/api/placeholder/64/64',
  party_karma_score: 750,
  total_events_attended: 12,
  verification_status: 'verified',
  location: 'Koh Phangan, Thailand'
};

const mockPosts: Post[] = [
  {
    id: '1',
    user: {
      id: '2',
      display_name: 'Sarah Wilson',
      avatar_url: '/api/placeholder/48/48',
      party_karma_score: 450,
      total_events_attended: 8,
      verification_status: 'verified'
    },
    content: 'Just had the most incredible night at the Half Moon Festival! The jungle setting was absolutely magical ✨🌙',
    photos: ['/api/placeholder/400/300'],
    event: {
      id: '2',
      title: 'Half Moon Festival',
      start_datetime: '2025-01-20T22:00:00Z'
    },
    likes_count: 24,
    comments_count: 8,
    is_liked: false,
    created_at: '2025-01-21T02:30:00Z',
    post_type: 'event_checkin'
  },
  {
    id: '2',
    user: {
      id: '3',
      display_name: 'Mike Chen',
      avatar_url: '/api/placeholder/48/48',
      party_karma_score: 320,
      total_events_attended: 5,
      verification_status: 'verified'
    },
    content: 'First time at Full Moon Party and I\'m blown away! The energy here is unreal 🔥',
    photos: [],
    likes_count: 18,
    comments_count: 4,
    is_liked: true,
    created_at: '2025-01-13T23:45:00Z',
    post_type: 'text'
  }
];

const mockLeaderboard: LeaderboardUser[] = [
  { id: '1', display_name: 'Alex Thunder', avatar_url: '/api/placeholder/48/48', party_karma_score: 1250, total_events_attended: 25, rank: 1 },
  { id: '2', display_name: 'Luna Beats', avatar_url: '/api/placeholder/48/48', party_karma_score: 1100, total_events_attended: 22, rank: 2 },
  { id: '3', display_name: 'Cosmic Dave', avatar_url: '/api/placeholder/48/48', party_karma_score: 980, total_events_attended: 19, rank: 3 },
  { id: '4', display_name: 'Neon Sarah', avatar_url: '/api/placeholder/48/48', party_karma_score: 850, total_events_attended: 17, rank: 4 },
  { id: '5', display_name: 'John Doe', avatar_url: '/api/placeholder/48/48', party_karma_score: 750, total_events_attended: 12, rank: 5 }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'groups'>('feed');
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [filter, setFilter] = useState<'all' | 'following' | 'events' | 'reviews'>('all');
  const [user] = useState<User>(mockUser);

  useEffect(() => {
    fetchData();
  }, [activeTab, filter]);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (activeTab === 'feed') {
      setPosts(mockPosts);
    } else if (activeTab === 'leaderboard') {
      setLeaderboard(mockLeaderboard);
    }
    setLoading(false);
  };

  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    const newPostObj: Post = {
      id: Date.now().toString(),
      user: user,
      content: newPost,
      photos: [],
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      created_at: new Date().toISOString(),
      post_type: 'text'
    };

    setPosts(prev => [newPostObj, ...prev]);
    setNewPost('');
  };

  const toggleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? {
            ...p,
            is_liked: !p.is_liked,
            likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
          }
        : p
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getKarmaLevel = (score: number) => {
    if (score >= 1000) return { level: 'Legend', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 500) return { level: 'VIP', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (score >= 200) return { level: 'Regular', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (score >= 50) return { level: 'Active', color: 'text-green-400', bg: 'bg-green-500/20' };
    return { level: 'Newbie', color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera size={16} />;
      case 'event_checkin': return <Calendar size={16} />;
      case 'venue_review': return <Star size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Community</h1>
          <p className="text-purple-200">Connect with fellow party lovers in Koh Phangan</p>
        </motion.div>

        {/* User Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.display_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">{user.display_name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getKarmaLevel(user.party_karma_score).bg} ${getKarmaLevel(user.party_karma_score).color}`}>
                    {getKarmaLevel(user.party_karma_score).level}
                  </span>
                  {user.verification_status === 'verified' && (
                    <span className="text-green-400 text-xs">✓ Verified</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-2xl">{user.party_karma_score}</div>
              <div className="text-purple-200 text-sm">Karma Score</div>
              <div className="text-purple-200 text-sm">{user.total_events_attended} events attended</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'feed' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <MessageCircle size={16} />
              Feed
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'leaderboard' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Trophy size={16} />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'groups' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Users size={16} />
              Groups
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Post Creation */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {user.display_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Share your party experience..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-gray-300 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                        <Camera size={16} />
                      </button>
                      <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                        <MapPin size={16} />
                      </button>
                    </div>
                    <button
                      onClick={createPost}
                      disabled={!newPost.trim()}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  {(['all', 'following', 'events', 'reviews'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                        filter === filterType 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                      }`}
                    >
                      {filterType}
                    </button>
                  ))}
                </div>

                {/* Posts */}
                <AnimatePresence>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-pulse">
                          <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-white/20 rounded mb-2 w-1/4"></div>
                              <div className="h-3 bg-white/20 rounded w-1/6"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-white/20 rounded"></div>
                            <div className="h-4 bg-white/20 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    posts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
                      >
                        <div className="flex gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {post.user.display_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold">{post.user.display_name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getKarmaLevel(post.user.party_karma_score).bg} ${getKarmaLevel(post.user.party_karma_score).color}`}>
                                {getKarmaLevel(post.user.party_karma_score).level}
                              </span>
                              {post.user.verification_status === 'verified' && (
                                <span className="text-green-400 text-xs">✓</span>
                              )}
                              <div className="flex items-center gap-1 text-purple-300">
                                {getPostTypeIcon(post.post_type)}
                              </div>
                            </div>
                            <p className="text-purple-200 text-sm">{formatDate(post.created_at)}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-white leading-relaxed">{post.content}</p>
                          {post.event && (
                            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex items-center gap-2 text-purple-300">
                                <Calendar size={14} />
                                <span className="text-sm">Checked in at {post.event.title}</span>
                              </div>
                            </div>
                          )}
                          {post.photos.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 gap-2">
                              {post.photos.map((photo, index) => (
                                <div key={index} className="h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 pt-4">
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => toggleLike(post.id)}
                              className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
                            >
                              <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                              <span>{post.likes_count}</span>
                            </button>
                            <button className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
                              <MessageCircle className="w-5 h-5" />
                              <span>{post.comments_count}</span>
                            </button>
                          </div>
                          <button className="text-white hover:text-purple-400 transition-colors">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Top Party Legends</h2>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400 w-8">
                        #{user.rank}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.display_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{user.display_name}</h3>
                        <p className="text-purple-200 text-sm">{user.total_events_attended} events attended</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">{user.party_karma_score}</div>
                        <div className="text-purple-200 text-sm">Karma</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="text-center py-12">
                  <Users className="mx-auto text-white/50 mb-4" size={64} />
                  <h3 className="text-white text-xl mb-2">Groups Coming Soon</h3>
                  <p className="text-purple-200">Connect with party crews and make new friends</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Events */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Happening Tonight</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm">Full Moon Party</h4>
                  <p className="text-purple-200 text-xs">Haad Rin Beach • 8:00 PM</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm">Sunset Beach Vibes</h4>
                  <p className="text-purple-200 text-xs">Secret Beach • 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-200">Active Members</span>
                  <span className="text-white font-bold">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Events This Month</span>
                  <span className="text-white font-bold">28</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Posts Today</span>
                  <span className="text-white font-bold">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}