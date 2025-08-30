<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScrapedEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'channel' => $this->channel,
            'description' => $this->description,
            'clean_description' => $this->clean_description,
            'event_type' => $this->event_type,
            'event_date' => $this->event_date?->format('Y-m-d'),
            'formatted_event_date' => $this->formatted_event_date,
            'event_date_time' => $this->event_date_time,
            'location' => $this->location,
            'has_location' => $this->has_location,
            'keywords_found' => $this->keywords_found,
            'primary_keywords' => $this->primary_keywords,
            'urls' => $this->urls,
            'mentions' => $this->mentions,
            'urgency' => $this->urgency,
            'is_today' => $this->is_today,
            'is_tomorrow' => $this->is_tomorrow,
            'is_this_weekend' => $this->is_this_weekend,
            'emojis' => [
                'type' => $this->type_emoji,
                'location' => $this->location_emoji,
            ],
            'date_posted' => $this->date_posted?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}