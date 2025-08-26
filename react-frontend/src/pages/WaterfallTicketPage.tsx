import {useEffect} from 'react';
import {motion} from 'framer-motion';
import {Calendar, Clock, MapPin, Music, Sparkles} from 'lucide-react';

export default function WaterfallTicketPage() {
  const eventDetails = {
    name: 'Waterfall Festival Koh Phangan',
    subtitle: 'Special Edition • Aug 27th',
    date: 'Wednesday, Aug 27, 2025',
    time: '9:00 PM - 7:00 AM',
    location: 'Waterfall Festival, Koh Phangan',
    price: 900,
    description: 'One last night to lose yourself in sound, jungle, and sunrise magic. Experience 4 custom stages in a natural waterfall setting.',
    included: ['Fast track entry', '1 free beer', '4 custom stages', 'Fire dancers', 'Laser shows', 'Food stalls', 'Chill zones']
  };


  // Load Tab widget
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      window.widgetSettings = {
        businessCode: "eeatl",
      };
      (()=>{function t(){window.widgetSettings.baseURL=window.widgetSettings.baseURL||"https://checkout.tab.travel";var t=document.createElement("script"),e=(t.type="text/javascript",t.async=!0,t.src="https://checkout.tab.travel/widget.js",document.getElementsByTagName("script")[0]);e.parentNode.insertBefore(t,e)}"complete"===document.readyState?t():window.attachEvent?window.attachEvent("onload",t):window.addEventListener("load",t,!1)})();
    `;
    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(script);
      } catch (e) {
        console.error('Error removing script:', e);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-teal-400 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Event Header */}
          <div className="text-center text-white space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full mb-4 overflow-hidden"
            >
              <img 
                src="/waterfall-party.jpeg" 
                alt="Waterfall Festival" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-teal-200 bg-clip-text text-transparent">
              {eventDetails.name}
            </h1>
            <div className="flex items-center justify-center gap-2 text-blue-200">
              <Sparkles className="w-5 h-5" />
              <span>Tropical Paradise Experience</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Event Details Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4"
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="w-5 h-5 text-blue-300" />
                <span>{eventDetails.date}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Clock className="w-5 h-5 text-blue-300" />
                <span>{eventDetails.time}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="w-5 h-5 text-blue-300" />
                <span>{eventDetails.location}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Music className="w-5 h-5 text-blue-300" />
                <span>Electronic • Tropical House • Chill</span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <p className="text-blue-100 text-sm leading-relaxed">
                {eventDetails.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-semibold">What's Included:</h4>
              <div className="grid grid-cols-2 gap-2">
                {eventDetails.included.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-blue-100 text-sm">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-center">
              <div className="text-white text-2xl font-bold">
                ฿{eventDetails.price.toLocaleString()}
              </div>
              <div className="text-green-100 text-sm">per person</div>
            </div>
          </motion.div>


          <div className="text-center text-blue-200 text-sm">
            <p>Secure payment • Instant confirmation • Mobile optimized</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}