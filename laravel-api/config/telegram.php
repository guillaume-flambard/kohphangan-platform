<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Telegram API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Telegram API scraping service
    |
    */

    'api_id' => env('TELEGRAM_API_ID'),
    'api_hash' => env('TELEGRAM_API_HASH'),
    'phone' => env('TELEGRAM_PHONE'),
    
    /*
    |--------------------------------------------------------------------------
    | Channels to Monitor
    |--------------------------------------------------------------------------
    |
    | List of Telegram channels to scrape for events
    |
    */
    
    'channels' => [
        'phanganparty',
        'koh_phangan_events',
        'phangan_island_life',
        'fullmoon_parties',
        'waterfall_festivals'
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Event Keywords
    |--------------------------------------------------------------------------
    |
    | Keywords to identify relevant event messages
    |
    */
    
    'keywords' => [
        'party', 'event', 'festival', 'music', 'dj', 'waterfall', 
        'beach', 'fullmoon', 'halfmoon', 'jungle', 'eco', 'yoga',
        'wellness', 'concert', 'nightlife', 'bar', 'club', 'celebration',
        'phangan', 'koh phangan', 'echo', 'rave', 'dance', 'techno',
        'house', 'trance', 'chill', 'sunset', 'sunrise', 'bamboo'
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Scraping Settings
    |--------------------------------------------------------------------------
    |
    | General scraping configuration
    |
    */
    
    'message_limit' => env('TELEGRAM_MESSAGE_LIMIT', 100),
    'rate_limit_delay' => env('TELEGRAM_RATE_LIMIT_DELAY', 2), // seconds
];