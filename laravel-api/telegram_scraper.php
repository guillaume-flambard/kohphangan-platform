<?php

/**
 * PHP Telegram Event Scraper for Koh Phangan Partners
 * Adaptation of the Python script using MadelineProto for legal data extraction
 */

require_once __DIR__ . '/vendor/autoload.php';

use danog\MadelineProto\API;
use danog\MadelineProto\Logger;

class TelegramEventScraper
{
    private $apiId;
    private $apiHash;
    private $phoneNumber;
    private $client;
    private $channels;
    private $keywords;
    
    public function __construct()
    {
        $this->apiId = config('telegram.api_id');
        $this->apiHash = config('telegram.api_hash');
        $this->phoneNumber = config('telegram.phone');
        
        $this->channels = config('telegram.channels', []);
        $this->keywords = config('telegram.keywords', []);
    }
    
    /**
     * Initialize Telegram client using MadelineProto
     */
    public function initializeClient()
    {
        if (empty($this->apiId) || empty($this->apiHash)) {
            throw new Exception('Telegram API credentials not configured');
        }
        
        try {
            $settings = [
                'app_info' => [
                    'api_id' => $this->apiId,
                    'api_hash' => $this->apiHash,
                ],
                'logger' => [
                    'logger' => Logger::ECHO_LOGGER,
                    'logger_level' => Logger::LEVEL_NOTICE,
                ],
            ];
            
            $this->client = new API('session.madeline', $settings);
            $this->client->start();
            
            echo "MadelineProto client initialized successfully\n";
            return true;
            
        } catch (Exception $e) {
            echo "Failed to initialize Telegram client: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Get channel messages using MadelineProto
     */
    public function getChannelMessages($channelUsername, $limit = 100)
    {
        try {
            // Get channel entity
            $channel = $this->client->getInfo($channelUsername);
            
            if (!$channel) {
                echo "Channel {$channelUsername} not found\n";
                return [];
            }
            
            // Get message history
            $messages = $this->client->messages->getHistory([
                'peer' => $channelUsername,
                'limit' => $limit,
                'offset_date' => 0,
                'offset_id' => 0,
                'max_id' => 0,
                'min_id' => 0,
                'add_offset' => 0,
                'hash' => 0
            ]);
            
            $result = [];
            foreach ($messages['messages'] as $message) {
                if (!empty($message['message'])) {
                    $result[] = [
                        'id' => $message['id'],
                        'text' => $message['message'],
                        'date' => $message['date'],
                        'channel' => $channelUsername,
                        'entities' => $message['entities'] ?? []
                    ];
                }
            }
            
            return $result;
            
        } catch (Exception $e) {
            echo "Error fetching messages from {$channelUsername}: " . $e->getMessage() . "\n";
            return [];
        }
    }
    
    /**
     * Extract event information from message text
     */
    public function extractEventInfo($message)
    {
        $text = strtolower($message['text']);
        $eventInfo = [
            'raw_message' => $message['text'],
            'channel' => $message['channel'],
            'date_posted' => date('Y-m-d H:i:s', $message['date']),
            'event_date' => null,
            'location' => null,
            'event_type' => null,
            'description' => $message['text'],
            'keywords_found' => [],
            'urls' => [],
            'mentions' => []
        ];
        
        // Extract keywords
        foreach ($this->keywords as $keyword) {
            if (strpos($text, strtolower($keyword)) !== false) {
                $eventInfo['keywords_found'][] = $keyword;
            }
        }
        
        // Extract dates using regex
        $datePatterns = [
            '/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/',
            '/(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{2,4})/i',
            '/(today|tomorrow|tonight|this weekend|next week)/i'
        ];
        
        foreach ($datePatterns as $pattern) {
            if (preg_match($pattern, $message['text'], $matches)) {
                $eventInfo['event_date'] = $this->parseDate($matches[1]);
                break;
            }
        }
        
        // Extract locations
        $locationKeywords = [
            'beach', 'jungle', 'waterfall', 'bar', 'club', 'resort', 
            'haad', 'ban', 'thong', 'rin', 'sala', 'secret'
        ];
        
        foreach ($locationKeywords as $locKeyword) {
            if (strpos($text, $locKeyword) !== false) {
                // Extract surrounding context for location
                $pos = strpos($text, $locKeyword);
                $context = substr($text, max(0, $pos - 20), 60);
                $eventInfo['location'] = trim($context);
                break;
            }
        }
        
        // Extract URLs
        if (preg_match_all('/(https?:\/\/[^\s]+)/', $message['text'], $urlMatches)) {
            $eventInfo['urls'] = $urlMatches[1];
        }
        
        // Extract mentions
        if (preg_match_all('/@(\w+)/', $message['text'], $mentionMatches)) {
            $eventInfo['mentions'] = $mentionMatches[1];
        }
        
        // Determine event type
        if (in_array('party', $eventInfo['keywords_found'])) {
            $eventInfo['event_type'] = 'party';
        } elseif (in_array('festival', $eventInfo['keywords_found'])) {
            $eventInfo['event_type'] = 'festival';
        } elseif (in_array('yoga', $eventInfo['keywords_found'])) {
            $eventInfo['event_type'] = 'wellness';
        } else {
            $eventInfo['event_type'] = 'general';
        }
        
        return $eventInfo;
    }
    
    /**
     * Parse various date formats
     */
    private function parseDate($dateString)
    {
        $dateString = strtolower(trim($dateString));
        
        if ($dateString === 'today') {
            return date('Y-m-d');
        } elseif ($dateString === 'tomorrow') {
            return date('Y-m-d', strtotime('+1 day'));
        } elseif ($dateString === 'tonight') {
            return date('Y-m-d');
        }
        
        // Try to parse the date
        try {
            $timestamp = strtotime($dateString);
            if ($timestamp !== false) {
                return date('Y-m-d', $timestamp);
            }
        } catch (Exception $e) {
            // Date parsing failed
        }
        
        return null;
    }
    
    /**
     * Save events to database
     */
    public function saveEventToDatabase($eventInfo)
    {
        try {
            // Check if this event already exists
            $existing = DB::table('scraped_events')
                ->where('raw_message', $eventInfo['raw_message'])
                ->where('channel', $eventInfo['channel'])
                ->first();
            
            if ($existing) {
                return false; // Already exists
            }
            
            // Insert new event
            DB::table('scraped_events')->insert([
                'channel' => $eventInfo['channel'],
                'raw_message' => $eventInfo['raw_message'],
                'event_date' => $eventInfo['event_date'],
                'location' => $eventInfo['location'],
                'event_type' => $eventInfo['event_type'],
                'description' => $eventInfo['description'],
                'keywords_found' => json_encode($eventInfo['keywords_found']),
                'urls' => json_encode($eventInfo['urls']),
                'mentions' => json_encode($eventInfo['mentions']),
                'date_posted' => $eventInfo['date_posted'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return true;
            
        } catch (Exception $e) {
            echo "Database error: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Main scraping function
     */
    public function scrapeEvents($daysBack = 7)
    {
        try {
            $this->initializeClient();
            $totalEvents = 0;
            $newEvents = 0;
            
            echo "Starting event scraping for " . count($this->channels) . " channels\n";
            
            foreach ($this->channels as $channel) {
                echo "Processing channel: {$channel}\n";
                
                $messages = $this->getChannelMessages($channel, 100);
                
                foreach ($messages as $message) {
                    $totalEvents++;
                    
                    // Skip messages older than specified days
                    if ($message['date'] < strtotime("-{$daysBack} days")) {
                        continue;
                    }
                    
                    // Extract event information
                    $eventInfo = $this->extractEventInfo($message);
                    
                    // Only save if it contains relevant keywords
                    if (!empty($eventInfo['keywords_found'])) {
                        if ($this->saveEventToDatabase($eventInfo)) {
                            $newEvents++;
                            echo "  ✓ New event found: " . substr($eventInfo['description'], 0, 100) . "...\n";
                        }
                    }
                }
                
                // Rate limiting - don't overwhelm the API
                sleep(2);
            }
            
            echo "\nScraping completed:\n";
            echo "- Total messages processed: {$totalEvents}\n";
            echo "- New events found: {$newEvents}\n";
            
            return [
                'success' => true,
                'total_processed' => $totalEvents,
                'new_events' => $newEvents
            ];
            
        } catch (Exception $e) {
            echo "Scraping error: " . $e->getMessage() . "\n";
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Make HTTP API request to Telegram
     */
    private function makeApiRequest($method, $params = [])
    {
        // This is a placeholder - implement actual Telegram API calls
        // For production use, consider libraries like:
        // - telegram-bot-sdk/telegram-bot-sdk
        // - westacks/telebot
        
        // Mock response for demonstration
        return [
            'ok' => true,
            'result' => []
        ];
    }
    
    /**
     * Get events from database with filters
     */
    public function getEvents($filters = [])
    {
        $query = DB::table('scraped_events');
        
        if (!empty($filters['event_type'])) {
            $query->where('event_type', $filters['event_type']);
        }
        
        if (!empty($filters['date_from'])) {
            $query->where('event_date', '>=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $query->where('event_date', '<=', $filters['date_to']);
        }
        
        if (!empty($filters['keywords'])) {
            $query->where('keywords_found', 'like', '%' . $filters['keywords'] . '%');
        }
        
        return $query->orderBy('event_date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();
    }
}

// CLI usage example
if (php_sapi_name() === 'cli') {
    echo "Koh Phangan Event Scraper\n";
    echo "========================\n\n";
    
    $scraper = new TelegramEventScraper();
    $result = $scraper->scrapeEvents(7); // Last 7 days
    
    if ($result['success']) {
        echo "Scraping completed successfully!\n";
    } else {
        echo "Scraping failed: " . $result['error'] . "\n";
    }
}