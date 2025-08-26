import {useEffect} from 'react';

export default function WaterfallEchoEventPage() {
  useEffect(() => {
    // Set page title and favicon
    document.title = 'Waterfall Party - Phangan.ai';
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Waterfall Party - Secure booking powered by Echo via Phangan.ai');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Waterfall Party - Secure booking powered by Echo via Phangan.ai';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content - Tab widget iframe */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Tab widget iframe */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-1">
            <iframe
              src="https://checkout.tab.travel/product/eeatl-act-1"
              width="100%"
              height="800"
              frameBorder="0"
              scrolling="auto"
              className="rounded-xl"
              title="Waterfall Party Booking via Echo"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}