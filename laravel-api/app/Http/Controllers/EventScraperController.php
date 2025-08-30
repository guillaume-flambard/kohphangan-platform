<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventFilterRequest;
use App\Http\Resources\ScrapedEventResource;
use App\Models\ScrapedEvent;
use App\Services\TelegramScrapingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class EventScraperController extends Controller
{
    protected TelegramScrapingService $telegramService;

    public function __construct(TelegramScrapingService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Get scraped events with advanced filtering
     */
    public function getEvents(EventFilterRequest $request): AnonymousResourceCollection|JsonResponse
    {
        try {
            $query = ScrapedEvent::query();

            // Apply filters
            $this->applyFilters($query, $request);

            // Apply sorting
            $sortBy = $request->validated('sort_by', 'event_date');
            $sortDirection = $request->validated('sort_direction', 'asc');
            
            if ($sortBy === 'event_date') {
                // Put events with dates first, then null dates
                $query->orderByRaw('event_date IS NULL, event_date ' . $sortDirection);
            } else {
                $query->orderBy($sortBy, $sortDirection);
            }

            // Paginate results
            $perPage = $request->validated('per_page', 20);
            $events = $query->paginate($perPage);

            return ScrapedEventResource::collection($events);

        } catch (Exception $e) {
            Log::error('Error fetching scraped events', [
                'error' => $e->getMessage(),
                'filters' => $request->validated()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch events',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Run the event scraper manually via Artisan command
     */
    public function runScraper(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'channels' => 'sometimes|array',
                'channels.*' => 'string|max:50',
                'limit' => 'sometimes|integer|min:1|max:1000',
                'clear' => 'sometimes|boolean'
            ]);

            // Build artisan command options
            $options = [];
            
            if ($request->filled('channels')) {
                foreach ($request->channels as $channel) {
                    $options[] = '--channel=' . $channel;
                }
            }
            
            if ($request->filled('limit')) {
                $options[] = '--limit=' . $request->limit;
            }
            
            if ($request->boolean('clear')) {
                $options[] = '--clear';
            }

            $options[] = '--no-interaction';

            // Run the artisan command
            $exitCode = Artisan::call('telegram:scrape', array_reduce($options, function($carry, $option) {
                [$key, $value] = strpos($option, '=') !== false 
                    ? explode('=', $option, 2) 
                    : [$option, true];
                $carry[ltrim($key, '-')] = $value;
                return $carry;
            }, []));

            $output = Artisan::output();

            Log::info('Manual event scraper executed', [
                'exit_code' => $exitCode,
                'options' => $options
            ]);

            return response()->json([
                'success' => $exitCode === 0,
                'message' => $exitCode === 0 ? 'Scraping completed successfully' : 'Scraping failed',
                'exit_code' => $exitCode,
                'output' => $output,
                'stats' => ScrapedEvent::getStatistics()
            ]);

        } catch (Exception $e) {
            Log::error('Manual event scraper error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Scraper execution failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get comprehensive event statistics
     */
    public function getEventStats(): JsonResponse
    {
        try {
            $stats = ScrapedEvent::getStatistics();
            $popularLocations = ScrapedEvent::getPopularLocations(10);
            $trendingKeywords = ScrapedEvent::getTrendingKeywords(20);

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'popular_locations' => $popularLocations,
                'trending_keywords' => $trendingKeywords,
                'generated_at' => now()->toISOString()
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching event stats', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Apply filters to query based on request
     */
    protected function applyFilters($query, EventFilterRequest $request): void
    {
        $validated = $request->validated();

        // Filter by event type
        if (!empty($validated['event_type'])) {
            $query->ofType($validated['event_type']);
        }

        // Filter by channel
        if (!empty($validated['channel'])) {
            $query->fromChannel($validated['channel']);
        }

        // Filter by date range
        if (!empty($validated['date_from']) || !empty($validated['date_to'])) {
            $dateFrom = !empty($validated['date_from']) ? Carbon::parse($validated['date_from']) : null;
            $dateTo = !empty($validated['date_to']) ? Carbon::parse($validated['date_to']) : null;
            $query->betweenDates($dateFrom, $dateTo);
        }

        // Filter by location
        if (!empty($validated['location'])) {
            $query->atLocation($validated['location']);
        }

        // Filter by keywords
        if (!empty($validated['keywords'])) {
            $query->withKeywords($validated['keywords']);
        }
    }
}
