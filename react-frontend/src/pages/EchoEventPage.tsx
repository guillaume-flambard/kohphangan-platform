import {useEffect} from 'react';

export default function WaterfallEchoEventPage() {
  useEffect(() => {
    // Set page title
    document.title = 'Waterfall Festival Echo - Phangan.ai';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-900">
      {/* Header with minimal branding */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-white/90">
            phangan.ai/events/waterfall/echo
          </h1>
        </div>
      </div>

      {/* Main content - Tab widget iframe */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Event title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Waterfall Festival Echo
            </h2>
            <p className="text-white/70">
              Secure payment powered by Tab Travel
            </p>
          </div>

          {/* Tab widget iframe */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-1">
            <iframe
              src="https://checkout.tab.travel/product/eeatl-act-1"
              width="100%"
              height="800"
              frameBorder="0"
              scrolling="auto"
              className="rounded-xl"
              title="Waterfall Festival Echo Booking"
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