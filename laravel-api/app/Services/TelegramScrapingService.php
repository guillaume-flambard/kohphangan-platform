<?php

namespace App\Services;

use App\Models\ScrapedEvent;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Exception;

class TelegramScrapingService
{
    protected array $config;
    protected array $keywords;
    protected $client = null;

    public function __construct()
    {
        $this->config = config('telegram', []);
        $this->keywords = $this->config['keywords'] ?? [];
        
        // Don't throw exception in constructor - let methods handle it
    }

    /**
     * Initialize MadelineProto client
     */
    public function initializeClient(): bool
    {
        try {
            // For now, we'll use a simulation approach
            // In production, this would initialize MadelineProto
            Log::info('TelegramScrapingService: Client initialized');
            return true;
        } catch (Exception $e) {
            Log::error('TelegramScrapingService: Failed to initialize client', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Scrape events from specified channels
     */
    public function scrapeEvents(array $channels = null, int $limit = 100): Collection
    {
        $channels = $channels ?? $this->config['channels'] ?? ['phanganparty'];
        $allEvents = collect();

        foreach ($channels as $channel) {
            try {
                Log::info("Scraping channel: {$channel}");
                $messages = $this->getChannelMessages($channel, $limit);
                $events = $this->processMessages($messages, $channel);
                $allEvents = $allEvents->concat($events);
                
                Log::info("Found {$events->count()} events in channel {$channel}");
            } catch (Exception $e) {
                Log::error("Error scraping channel {$channel}", [
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $allEvents;
    }

    /**
     * Get messages from Telegram channel
     */
    protected function getChannelMessages(string $channel, int $limit): Collection
    {
        // For now, simulate real Telegram data
        // In production, this would use MadelineProto to get real messages
        return $this->simulateChannelMessages($channel, $limit);
    }

    /**
     * Process messages and extract event information
     */
    protected function processMessages(Collection $messages, string $channel): Collection
    {
        return $messages->map(function ($message) use ($channel) {
            return $this->extractEventInfo($message, $channel);
        })->filter(function ($event) {
            return $event !== null && !empty($event['keywords_found']);
        });
    }

    /**
     * Extract structured event information from message
     */
    protected function extractEventInfo(array $message, string $channel): ?array
    {
        $text = $message['text'] ?? '';
        $textLower = strtolower($text);

        // Find matching keywords
        $keywordsFound = [];
        foreach ($this->keywords as $keyword) {
            if (str_contains($textLower, strtolower($keyword))) {
                $keywordsFound[] = $keyword;
            }
        }

        // Skip if no relevant keywords
        if (empty($keywordsFound)) {
            return null;
        }

        return [
            'channel' => $channel,
            'raw_message' => $text,
            'event_date' => $this->extractEventDate($text),
            'location' => $this->extractLocation($text),
            'event_type' => $this->determineEventType($keywordsFound),
            'description' => $this->cleanDescription($text),
            'keywords_found' => $keywordsFound,
            'urls' => $this->extractUrls($text),
            'mentions' => $this->extractMentions($text),
            'date_posted' => Carbon::createFromTimestamp($message['date'] ?? time()),
        ];
    }

    /**
     * Extract event date from message text
     */
    protected function extractEventDate(string $text): ?Carbon
    {
        $textLower = strtolower($text);

        // Tonight
        if (str_contains($textLower, 'tonight')) {
            return Carbon::today();
        }

        // Tomorrow
        if (str_contains($textLower, 'tomorrow')) {
            return Carbon::tomorrow();
        }

        // This weekend
        if (str_contains($textLower, 'weekend') || str_contains($textLower, 'this weekend')) {
            return Carbon::now()->next(Carbon::SATURDAY);
        }

        // Specific month patterns
        $monthPatterns = [
            '/september\s+(\d+)/i' => '2025-09-',
            '/october\s+(\d+)/i' => '2025-10-',
            '/november\s+(\d+)/i' => '2025-11-',
            '/december\s+(\d+)/i' => '2024-12-',
            '/january\s+(\d+)/i' => '2025-01-',
            '/february\s+(\d+)/i' => '2025-02-',
            '/march\s+(\d+)/i' => '2025-03-',
        ];

        foreach ($monthPatterns as $pattern => $yearMonth) {
            if (preg_match($pattern, $text, $matches)) {
                $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                try {
                    return Carbon::createFromFormat('Y-m-d', $yearMonth . $day);
                } catch (Exception $e) {
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Extract location from message text
     */
    protected function extractLocation(string $text): ?string
    {
        $locationPatterns = [
            '/📍\s*([^\n\r]+)/i',
            '/(haad\s+\w+(?:\s+\w+)?)/i',
            '/(ban\s+tai(?:\s+beach)?)/i',
            '/(thong\s+\w+(?:\s+\w+)?)/i',
            '/(secret\s+\w+\s+location)/i',
            '/(jungle\s+location)/i',
            '/(waterfall\s+location)/i',
            '/(beach)/i',
            '/(temple)/i',
        ];

        foreach ($locationPatterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $location = trim($matches[1]);
                $location = preg_replace('/[📍]/', '', $location);
                return substr(trim($location), 0, 255) ?: null;
            }
        }

        return null;
    }

    /**
     * Determine event type from keywords
     */
    protected function determineEventType(array $keywords): string
    {
        $partyKeywords = ['party', 'rave', 'club', 'dj', 'techno', 'house', 'trance', 'dance'];
        $festivalKeywords = ['festival'];
        $wellnessKeywords = ['yoga', 'wellness', 'meditation', 'healing', 'retreat'];

        if (array_intersect($keywords, $partyKeywords)) {
            return 'party';
        }

        if (array_intersect($keywords, $festivalKeywords)) {
            return 'festival';
        }

        if (array_intersect($keywords, $wellnessKeywords)) {
            return 'wellness';
        }

        return 'general';
    }

    /**
     * Clean and extract description from message
     */
    protected function cleanDescription(string $text): string
    {
        $lines = explode("\n", $text);
        $firstLine = trim($lines[0]);

        // Remove excessive emojis but keep context
        $cleaned = preg_replace('/[🎉🎵🎪🔥🌕🌅🌴🏖️🎨🏐🎭]{2,}/', '', $firstLine);
        $cleaned = preg_replace('/\s+/', ' ', $cleaned);
        $cleaned = trim($cleaned);

        return substr($cleaned ?: 'Event', 0, 255);
    }

    /**
     * Extract URLs from text
     */
    protected function extractUrls(string $text): array
    {
        preg_match_all('/(https?:\/\/[^\s]+)/', $text, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Extract mentions from text
     */
    protected function extractMentions(string $text): array
    {
        preg_match_all('/@(\w+)/', $text, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Save events to database
     */
    public function saveEvents(Collection $events): array
    {
        $stats = [
            'total_processed' => $events->count(),
            'saved' => 0,
            'skipped' => 0,
            'errors' => 0
        ];

        foreach ($events as $eventData) {
            try {
                // Check if event already exists
                $exists = ScrapedEvent::where('raw_message', $eventData['raw_message'])
                    ->where('channel', $eventData['channel'])
                    ->exists();

                if ($exists) {
                    $stats['skipped']++;
                    continue;
                }

                // Create new event
                ScrapedEvent::create([
                    'channel' => $eventData['channel'],
                    'raw_message' => $eventData['raw_message'],
                    'event_date' => $eventData['event_date']?->format('Y-m-d'),
                    'location' => $eventData['location'],
                    'event_type' => $eventData['event_type'],
                    'description' => $eventData['description'],
                    'keywords_found' => $eventData['keywords_found'],
                    'urls' => $eventData['urls'],
                    'mentions' => $eventData['mentions'],
                    'date_posted' => $eventData['date_posted'],
                ]);

                $stats['saved']++;

            } catch (Exception $e) {
                Log::error('Error saving event', [
                    'event' => $eventData,
                    'error' => $e->getMessage()
                ]);
                $stats['errors']++;
            }
        }

        Log::info('Event scraping completed', $stats);
        return $stats;
    }

    /**
     * Simulate real channel messages for testing
     */
    protected function simulateChannelMessages(string $channel, int $limit): Collection
    {
        // Real-looking messages from Koh Phangan
        $mockMessages = [
            [
                'text' => '🎉 ECHO WATERFALL PARTY 🎉
📅 Tonight 9 PM - Late
📍 Secret Jungle Location (Transport from Thong Sala)
🎵 LINEUP: 
▸ DJ MAYA (Techno/Progressive)
▸ BAMBOO (Deep House)  
▸ COSMIC FLOW (Psytrance)
💰 Entry: 800 THB (includes transport)
🎫 Limited capacity - Book now!
#EchoParty #WaterfallRave #TechnoPhangan',
                'date' => time(),
                'id' => 1001
            ],
            [
                'text' => '🌅 SUNRISE YOGA FLOW 🧘‍♀️
📅 Tomorrow 6:00 AM
📍 Haad Rin Beach (North End)
🎯 FREE SESSION with Instructor Luna
☕ Fresh coconuts & healthy breakfast after
🌺 All levels welcome
Join our mindful community! 
#YogaPhangan #SunriseYoga #Wellness #HaadRin',
                'date' => time() - 1800,
                'id' => 1002
            ],
            [
                'text' => '🌕 FULL MOON PARTY PREP! 🌕
📅 September 14-15, 2025
📍 Haad Rin Beach + Multiple Venues
🎵 3 Stages: Main Beach, Cactus Club, Drop In Bar
🎫 PRE-PARTY: Sep 13 at Paradise Bungalows
💰 Bucket specials, fire shows, international DJs
🚌 Free shuttles from all major beaches
Book accommodation NOW - selling out fast!
#FullMoonParty #HaadRin #September2025',
                'date' => time() - 3600,
                'id' => 1003
            ],
            [
                'text' => '🌴 JUNGLE HEALING RETREAT 🌴
📅 This Weekend (Sat-Sun)
📍 Wat Phu Khao Noi (Mountain Temple)
🧘‍♀️ Meditation, Sound Healing, Breathwork
🥗 Organic vegetarian meals included  
💎 Crystal bowl sessions with Ajahn Som
🏡 Stay overnight in temple guesthouse (optional)
💰 2-day package: 2,500 THB
Limited to 20 participants
#Retreat #Healing #Meditation #Temple',
                'date' => time() - 7200,
                'id' => 1004
            ],
            [
                'text' => '🎪 HALF MOON FESTIVAL 2025 🎪
📅 March 15-16, 2025  
📍 Ban Tai Beach + Jungle Venues
🎵 48 hours of music across 4 stages:
▸ Main Stage (Commercial EDM)
▸ Jungle Stage (Psytrance/Goa) 
▸ Chill Stage (Ambient/Downtempo)
▸ Underground (Techno/Minimal)
🎭 Fire performers, art installations
🍕 International food court
💰 Early Bird: 1,200 THB (until Jan 31)
#HalfMoon #Festival #BanTai #March2025',
                'date' => time() - 10800,
                'id' => 1005
            ]
        ];

        return collect($mockMessages)->take($limit);
    }
}