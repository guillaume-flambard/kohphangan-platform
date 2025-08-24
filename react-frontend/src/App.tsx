import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import BookingsPage from './pages/BookingsPage'
import CommunityPage from './pages/CommunityPage'
import FavoritesPage from './pages/FavoritesPage'
import MapPage from './pages/MapPage'
import TransportPage from './pages/TransportPage'
import WaterfallTicketPage from './pages/WaterfallTicketPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/events/waterfall/echo" element={<WaterfallTicketPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App