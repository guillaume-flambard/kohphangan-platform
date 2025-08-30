<?php

/**
 * Simple Telegram scraper test using cURL (without MadelineProto)
 * This mimics your Python script functionality
 */

class SimpleTelegramScraper
{
    private $apiId = '21975046';
    private $apiHash = '065d4c8616a2459590b113177a4a05b1';
    private $phone = '+66616548060';
    private $channels = ['phanganparty'];
    private $keywords = [
        'party', 'event', 'festival', 'music', 'dj', 'waterfall', 
        'beach', 'fullmoon', 'halfmoon', 'jungle', 'eco', 'yoga',
        'wellness', 'concert', 'nightlife', 'bar', 'club', 'celebration',
        'phangan', 'koh phangan', 'echo', 'rave', 'dance', 'techno'
    ];

    public function testConnection()
    {
        echo "🔍 Testing Telegram API Connection\n";
        echo "API ID: " . $this->apiId . "\n";
        echo "Phone: " . $this->phone . "\n";
        echo "Channels to scrape: " . implode(', ', $this->channels) . "\n\n";
        
        // For now, simulate what would happen
        return $this->simulateChannelData();
    }

    public function simulateChannelData()
    {
        echo "📱 Simulating channel data from 'phanganparty'...\n\n";
        
        $mockMessages = [
            [
                'id' => 1001,
                'text' => '🎉 WATERFALL ECHO PARTY 🎉
📅 Tonight at 9 PM  
📍 Secret Waterfall Location
🎵 Techno & House vibes
💫 Limited tickets available!
#waterfallparty #techno #phangan',
                'date' => time(),
                'channel' => 'phanganparty'
            ],
            [
                'id' => 1002,
                'text' => '🌅 SUNRISE YOGA & WELLNESS 🧘‍♀️
📅 Tomorrow 6 AM
📍 Haad Rin Beach  
🎯 Free meditation session
☀️ Watch the sunrise together!
#yoga #wellness #sunrise #beach',
                'date' => time() - 3600,
                'channel' => 'phanganparty'
            ],
            [
                'id' => 1003,
                'text' => '🌕 FULL MOON FESTIVAL 2025 🌕
📅 September 15-17
📍 Multiple locations across Koh Phangan
🎵 3 days of non-stop music
🎫 Early bird tickets now available!
#fullmoon #festival #kohphangan #music',
                'date' => time() - 7200,
                'channel' => 'phanganparty'
            ]
        ];

        $processedEvents = [];
        
        foreach ($mockMessages as $message) {
            $eventInfo = $this->extractEventInfo($message);
            if (!empty($eventInfo['keywords_found'])) {
                $processedEvents[] = $eventInfo;
                echo "✅ Event found: " . substr($eventInfo['description'], 0, 50) . "...\n";
                echo "   Keywords: " . implode(', ', $eventInfo['keywords_found']) . "\n";
                echo "   Type: " . $eventInfo['event_type'] . "\n";
                echo "   Location: " . ($eventInfo['location'] ?: 'Not specified') . "\n\n";
            }
        }

        return $processedEvents;
    }

    public function extractEventInfo($message)
    {
        $text = strtolower($message['text']);
        $eventInfo = [
            'raw_message' => $message['text'],
            'channel' => $message['channel'],
            'date_posted' => date('Y-m-d H:i:s', $message['date']),
            'event_date' => $this->extractDate($message['text']),
            'location' => $this->extractLocation($message['text']),
            'event_type' => 'general',
            'description' => $this->cleanDescription($message['text']),
            'keywords_found' => [],
            'urls' => $this->extractUrls($message['text']),
            'mentions' => $this->extractMentions($message['text'])
        ];

        // Extract keywords
        foreach ($this->keywords as $keyword) {
            if (strpos($text, strtolower($keyword)) !== false) {
                $eventInfo['keywords_found'][] = $keyword;
            }
        }

        // Determine event type
        if (in_array('party', $eventInfo['keywords_found']) || 
            in_array('rave', $eventInfo['keywords_found'])) {
            $eventInfo['event_type'] = 'party';
        } elseif (in_array('festival', $eventInfo['keywords_found'])) {
            $eventInfo['event_type'] = 'festival';
        } elseif (in_array('yoga', $eventInfo['keywords_found']) || 
                  in_array('wellness', $eventInfo['keywords_found'])) {
            $eventInfo['event_type'] = 'wellness';
        }

        return $eventInfo;
    }

    private function extractDate($text)
    {
        // Simple date extraction patterns
        if (preg_match('/tonight/i', $text)) {
            return date('Y-m-d');
        }
        if (preg_match('/tomorrow/i', $text)) {
            return date('Y-m-d', strtotime('+1 day'));
        }
        if (preg_match('/september\s+(\d+)/i', $text, $matches)) {
            return '2025-09-' . str_pad($matches[1], 2, '0', STR_PAD_LEFT);
        }
        return null;
    }

    private function extractLocation($text)
    {
        $patterns = [
            '/📍\s*([^\n\r]+)/i',
            '/(haad\s+\w+)/i',
            '/(secret\s+\w+\s+location)/i',
            '/(waterfall\s+location)/i'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[1]);
            }
        }
        
        return null;
    }

    private function cleanDescription($text)
    {
        // Remove emojis and extra whitespace, keep first line as description
        $lines = explode("\n", $text);
        $description = trim($lines[0]);
        $description = preg_replace('/[\x{1F600}-\x{1F64F}]/u', '', $description); // Remove emojis
        $description = preg_replace('/[\x{1F300}-\x{1F5FF}]/u', '', $description);
        $description = preg_replace('/[\x{1F680}-\x{1F6FF}]/u', '', $description);
        $description = preg_replace('/[\x{1F1E0}-\x{1F1FF}]/u', '', $description);
        return trim($description);
    }

    private function extractUrls($text)
    {
        preg_match_all('/(https?:\/\/[^\s]+)/', $text, $matches);
        return $matches[1] ?? [];
    }

    private function extractMentions($text)
    {
        preg_match_all('/@(\w+)/', $text, $matches);
        return $matches[1] ?? [];
    }

    public function saveToDatabase($events)
    {
        echo "💾 Would save " . count($events) . " events to database\n";
        echo "Database operations would happen here in production\n";
        return true;
    }
}

// Run the test
echo "Koh Phangan Event Scraper Test\n";
echo "==============================\n\n";

$scraper = new SimpleTelegramScraper();
$events = $scraper->testConnection();

if (!empty($events)) {
    echo "\n🎯 Summary:\n";
    echo "- Total events found: " . count($events) . "\n";
    
    $types = array_count_values(array_column($events, 'event_type'));
    foreach ($types as $type => $count) {
        echo "- {$type}: {$count} events\n";
    }
    
    $scraper->saveToDatabase($events);
} else {
    echo "❌ No events found\n";
}

echo "\n✅ Scraper test completed!\n";