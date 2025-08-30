<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class ScrapedEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel',
        'raw_message',
        'event_date',
        'location',
        'event_type',
        'description',
        'keywords_found',
        'urls',
        'mentions',
        'date_posted',
    ];

    protected $casts = [
        'event_date' => 'date',
        'date_posted' => 'datetime',
        'keywords_found' => 'array',
        'urls' => 'array',
        'mentions' => 'array',
    ];

    protected $dates = [
        'event_date',
        'date_posted',
        'created_at',
        'updated_at',
    ];

    // ===== SCOPES =====

    /**
     * Scope for filtering by event type
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('event_type', $type);
    }

    /**
     * Scope for filtering by channel
     */
    public function scopeFromChannel(Builder $query, string $channel): Builder
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope for upcoming events
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('event_date', '>=', Carbon::today())
                    ->orderBy('event_date', 'asc');
    }

    /**
     * Scope for events within date range
     */
    public function scopeBetweenDates(Builder $query, ?Carbon $from, ?Carbon $to): Builder
    {
        if ($from) {
            $query->where('event_date', '>=', $from);
        }
        
        if ($to) {
            $query->where('event_date', '<=', $to);
        }
        
        return $query;
    }

    /**
     * Scope for searching by keywords
     */
    public function scopeWithKeywords(Builder $query, array $keywords): Builder
    {
        return $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $keyword) {
                $q->orWhereJsonContains('keywords_found', $keyword);
            }
        });
    }

    /**
     * Scope for events with specific location keywords
     */
    public function scopeAtLocation(Builder $query, string $location): Builder
    {
        return $query->where('location', 'LIKE', "%{$location}%")
                    ->orWhere('raw_message', 'LIKE', "%{$location}%");
    }

    /**
     * Scope for recent events (posted in last N days)
     */
    public function scopeRecent(Builder $query, int $days = 7): Builder
    {
        return $query->where('date_posted', '>=', Carbon::now()->subDays($days));
    }

    // ===== ACCESSORS & MUTATORS =====

    /**
     * Get formatted event date
     */
    public function getFormattedEventDateAttribute(): ?string
    {
        return $this->event_date?->format('M j, Y');
    }

    /**
     * Get event date with time
     */
    public function getEventDateTimeAttribute(): ?string
    {
        if (!$this->event_date) {
            return null;
        }

        // Try to extract time from raw message
        $timePattern = '/(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i';
        if (preg_match($timePattern, $this->raw_message, $matches)) {
            return $this->event_date->format('M j, Y') . ' at ' . $matches[1];
        }

        return $this->formatted_event_date;
    }

    /**
     * Get clean description without emojis
     */
    public function getCleanDescriptionAttribute(): string
    {
        $description = $this->description;
        // Remove emojis for clean text display
        $description = preg_replace('/[\x{1F600}-\x{1F64F}]/u', '', $description);
        $description = preg_replace('/[\x{1F300}-\x{1F5FF}]/u', '', $description);
        $description = preg_replace('/[\x{1F680}-\x{1F6FF}]/u', '', $description);
        $description = preg_replace('/[\x{1F1E0}-\x{1F1FF}]/u', '', $description);
        return trim($description);
    }

    /**
     * Get primary keywords (most relevant)
     */
    public function getPrimaryKeywordsAttribute(): array
    {
        $primary = ['party', 'festival', 'yoga', 'wellness', 'beach', 'waterfall', 'fullmoon'];
        return array_intersect($this->keywords_found ?? [], $primary);
    }

    /**
     * Check if event has location info
     */
    public function getHasLocationAttribute(): bool
    {
        return !empty($this->location);
    }

    /**
     * Check if event is happening today
     */
    public function getIsTodayAttribute(): bool
    {
        return $this->event_date?->isToday() ?? false;
    }

    /**
     * Check if event is happening tomorrow
     */
    public function getIsTomorrowAttribute(): bool
    {
        return $this->event_date?->isTomorrow() ?? false;
    }

    /**
     * Check if event is this weekend
     */
    public function getIsThisWeekendAttribute(): bool
    {
        if (!$this->event_date) {
            return false;
        }

        $now = Carbon::now();
        $nextSaturday = $now->copy()->next(Carbon::SATURDAY);
        $nextSunday = $now->copy()->next(Carbon::SUNDAY);

        return $this->event_date->isSameDay($nextSaturday) || 
               $this->event_date->isSameDay($nextSunday);
    }

    /**
     * Get event urgency level
     */
    public function getUrgencyAttribute(): string
    {
        if (!$this->event_date) {
            return 'unknown';
        }

        if ($this->is_today) {
            return 'today';
        }

        if ($this->is_tomorrow) {
            return 'tomorrow';
        }

        if ($this->is_this_weekend) {
            return 'weekend';
        }

        $daysUntil = $this->event_date->diffInDays(Carbon::today());
        
        if ($daysUntil <= 7) {
            return 'this_week';
        }

        if ($daysUntil <= 30) {
            return 'this_month';
        }

        return 'future';
    }

    /**
     * Get event type emoji
     */
    public function getTypeEmojiAttribute(): string
    {
        return match($this->event_type) {
            'party' => '🎉',
            'festival' => '🎪',
            'wellness' => '🧘‍♀️',
            'general' => '📅',
            default => '🎯'
        };
    }

    /**
     * Get location emoji
     */
    public function getLocationEmojiAttribute(): string
    {
        if (!$this->location) {
            return '📍';
        }

        $location = strtolower($this->location);
        
        if (str_contains($location, 'beach') || str_contains($location, 'haad')) {
            return '🏖️';
        }
        
        if (str_contains($location, 'jungle') || str_contains($location, 'waterfall')) {
            return '🌴';
        }
        
        if (str_contains($location, 'temple')) {
            return '🏛️';
        }
        
        return '📍';
    }

    // ===== STATIC METHODS =====

    /**
     * Get event statistics
     */
    public static function getStatistics(): array
    {
        return [
            'total_events' => static::count(),
            'by_type' => static::selectRaw('event_type, COUNT(*) as count')
                              ->groupBy('event_type')
                              ->pluck('count', 'event_type'),
            'by_channel' => static::selectRaw('channel, COUNT(*) as count')
                                 ->groupBy('channel')
                                 ->orderByDesc('count')
                                 ->pluck('count', 'channel'),
            'recent_events' => static::recent()->count(),
            'upcoming_events' => static::upcoming()->count(),
            'events_today' => static::whereDate('event_date', Carbon::today())->count(),
            'events_this_week' => static::whereBetween('event_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
        ];
    }

    /**
     * Get popular locations
     */
    public static function getPopularLocations(int $limit = 10): array
    {
        return static::whereNotNull('location')
                    ->selectRaw('location, COUNT(*) as count')
                    ->groupBy('location')
                    ->orderByDesc('count')
                    ->limit($limit)
                    ->pluck('count', 'location')
                    ->toArray();
    }

    /**
     * Get trending keywords
     */
    public static function getTrendingKeywords(int $limit = 20): array
    {
        $keywords = [];
        
        static::whereNotNull('keywords_found')->chunk(100, function ($events) use (&$keywords) {
            foreach ($events as $event) {
                foreach ($event->keywords_found ?? [] as $keyword) {
                    $keywords[$keyword] = ($keywords[$keyword] ?? 0) + 1;
                }
            }
        });

        arsort($keywords);
        return array_slice($keywords, 0, $limit, true);
    }
}