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
      {/* Full screen iframe */}
      <iframe
        src="https://checkout.tab.travel/product/eeatl-act-1"
        width="100%"
        height="100vh"
        frameBorder="0"
        scrolling="auto"
        title="Waterfall Party Booking via Echo"
        style={{ border: 'none', display: 'block' }}
      />
    </div>
  );
}