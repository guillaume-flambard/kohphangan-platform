<?php

namespace App\Console\Commands;

use App\Services\TelegramScrapingService;
use App\Models\ScrapedEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Exception;

class ScrapeTelegramEvents extends Command
{
    protected $signature = 'telegram:scrape 
                           {--channel=* : Specific channels to scrape (default: all configured)}
                           {--limit=100 : Maximum messages to fetch per channel}
                           {--clear : Clear existing events before scraping}
                           {--dry-run : Show what would be scraped without saving}
                           {--stats : Show statistics after scraping}';

    protected $description = 'Scrape events from Telegram channels using Laravel best practices';

    protected TelegramScrapingService $telegramService;

    public function __construct(TelegramScrapingService $telegramService)
    {
        parent::__construct();
        $this->telegramService = $telegramService;
    }

    public function handle(): int
    {
        $this->showHeader();

        try {
            // Parse options
            $channels = $this->option('channel') ?: null;
            $limit = (int) $this->option('limit');
            $shouldClear = $this->option('clear');
            $isDryRun = $this->option('dry-run');
            $showStats = $this->option('stats');

            // Validate options
            if ($limit < 1 || $limit > 1000) {
                $this->error('❌ Limit must be between 1 and 1000');
                return Command::FAILURE;
            }

            // Initialize Telegram client
            $this->info('🔄 Initializing Telegram client...');
            if (!$this->telegramService->initializeClient()) {
                $this->error('❌ Failed to initialize Telegram client');
                return Command::FAILURE;
            }
            $this->info('✅ Telegram client ready');

            // Clear existing events if requested
            if ($shouldClear && !$isDryRun) {
                if ($this->confirm('🗑️  Clear all existing scraped events?', false)) {
                    ScrapedEvent::truncate();
                    $this->info('✅ Cleared existing events');
                }
            }

            // Show scraping parameters
            $this->showParameters($channels, $limit, $isDryRun);

            // Scrape events
            $this->info('📱 Starting scraping process...');
            $events = $this->telegramService->scrapeEvents($channels, $limit);

            if ($events->isEmpty()) {
                $this->warn('⚠️  No events found matching criteria');
                return Command::SUCCESS;
            }

            // Show found events
            $this->showFoundEvents($events);

            // Save events (unless dry run)
            $stats = ['saved' => 0, 'skipped' => 0, 'errors' => 0];
            if (!$isDryRun) {
                $this->info('💾 Saving events to database...');
                $progressBar = $this->output->createProgressBar($events->count());
                $progressBar->start();

                $stats = $this->telegramService->saveEvents($events);
                
                $progressBar->finish();
                $this->newLine(2);
                $this->showSaveResults($stats);
            } else {
                $this->info('🔍 Dry run completed - no data saved');
            }

            // Show statistics if requested
            if ($showStats && !$isDryRun) {
                $this->showStatistics();
            }

            $this->info('✅ Scraping completed successfully!');
            return Command::SUCCESS;

        } catch (Exception $e) {
            $this->error("❌ Scraping failed: {$e->getMessage()}");
            Log::error('Telegram scraping command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    protected function showHeader(): void
    {
        $this->line('');
        $this->line('🚀 <fg=cyan>Koh Phangan Event Scraper</fg=cyan>');
        $this->line('<fg=yellow>══════════════════════════════</fg=yellow>');
        $this->line('');
    }

    protected function showParameters(?array $channels, int $limit, bool $isDryRun): void
    {
        $this->line('<fg=yellow>📋 Scraping Parameters:</fg=yellow>');
        $this->line("   Channels: " . ($channels ? implode(', ', $channels) : 'All configured'));
        $this->line("   Message limit: {$limit} per channel");
        $this->line("   Mode: " . ($isDryRun ? 'DRY RUN' : 'LIVE'));
        $this->line('');
    }

    protected function showFoundEvents($events): void
    {
        $this->info("📥 Found {$events->count()} relevant events:");
        
        $eventsByType = $events->groupBy('event_type')->map->count();
        $eventsByChannel = $events->groupBy('channel')->map->count();

        $this->line('<fg=yellow>By Type:</fg=yellow>');
        foreach ($eventsByType as $type => $count) {
            $emoji = $this->getTypeEmoji($type);
            $this->line("   {$emoji} {$type}: {$count} events");
        }

        $this->line('<fg=yellow>By Channel:</fg=yellow>');
        foreach ($eventsByChannel as $channel => $count) {
            $this->line("   📱 {$channel}: {$count} events");
        }

        // Show sample events
        $this->line('<fg=yellow>Sample Events:</fg=yellow>');
        $events->take(3)->each(function ($event) {
            $emoji = $this->getTypeEmoji($event['event_type']);
            $description = substr($event['description'], 0, 50) . '...';
            $date = $event['event_date'] ? $event['event_date']->format('M j') : 'TBD';
            $this->line("   {$emoji} [{$date}] {$description}");
        });

        if ($events->count() > 3) {
            $this->line("   ... and " . ($events->count() - 3) . " more");
        }
        
        $this->line('');
    }

    protected function showSaveResults(array $stats): void
    {
        $this->line('<fg=yellow>💾 Save Results:</fg=yellow>');
        $this->line("   ✅ Saved: {$stats['saved']} events");
        
        if ($stats['skipped'] > 0) {
            $this->line("   ⏭️  Skipped: {$stats['skipped']} events (duplicates)");
        }
        
        if ($stats['errors'] > 0) {
            $this->line("   ❌ Errors: {$stats['errors']} events");
        }
        
        $this->line('');
    }

    protected function showStatistics(): void
    {
        $this->line('<fg=yellow>📊 Database Statistics:</fg=yellow>');
        
        $stats = ScrapedEvent::getStatistics();
        
        $this->line("   Total events: {$stats['total_events']}");
        $this->line("   Recent events: {$stats['recent_events']}");
        $this->line("   Upcoming events: {$stats['upcoming_events']}");
        $this->line("   Events today: {$stats['events_today']}");
        $this->line("   Events this week: {$stats['events_this_week']}");
        
        $this->line('<fg=yellow>Top Locations:</fg=yellow>');
        $locations = ScrapedEvent::getPopularLocations(5);
        foreach ($locations as $location => $count) {
            $this->line("   📍 {$location}: {$count} events");
        }
        
        $this->line('<fg=yellow>Trending Keywords:</fg=yellow>');
        $keywords = ScrapedEvent::getTrendingKeywords(10);
        $keywordList = collect($keywords)->take(10)->keys()->implode(', ');
        $this->line("   🔥 {$keywordList}");
        
        $this->line('');
    }

    protected function getTypeEmoji(string $type): string
    {
        return match($type) {
            'party' => '🎉',
            'festival' => '🎪',
            'wellness' => '🧘‍♀️',
            'general' => '📅',
            default => '🎯'
        };
    }
}