import {useEffect} from 'react';

export default function EchoEventPage() {
  useEffect(() => {
    // Set page title
    document.title = 'Echo Event - Phangan.ai';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900">
      {/* Header with minimal branding */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-white/90">
            phangan.ai/events/echo
          </h1>
        </div>
      </div>

      {/* Main content - Tab widget iframe */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Event title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Echo Event
            </h2>
            <p className="text-white/70">
              Secure payment powered by Tab Travel
            </p>
          </div>

          {/* Tab widget iframe */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-1">
            <iframe
              src="https://checkout.tab.travel/product/eeatl-act-3"
              width="100%"
              height="800"
              frameBorder="0"
              scrolling="auto"
              className="rounded-xl"
              title="Echo Event Booking"
              loading="lazy"
            />
          </div>

          {/* Footer info */}
          <div className="text-center mt-8 text-white/60 text-sm">
            <p>Secure checkout • Instant confirmation • Mobile optimized</p>
            <p className="mt-2">Powered by phangan.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
}