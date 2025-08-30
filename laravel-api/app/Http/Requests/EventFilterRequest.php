<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventFilterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'event_type' => 'sometimes|string|in:party,festival,wellness,general',
            'channel' => 'sometimes|string|max:50',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'keywords' => 'sometimes|array',
            'keywords.*' => 'string|max:50',
            'location' => 'sometimes|string|max:100',
            'urgency' => 'sometimes|string|in:today,tomorrow,weekend,this_week,this_month,future',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'sort_by' => 'sometimes|string|in:event_date,date_posted,created_at',
            'sort_direction' => 'sometimes|string|in:asc,desc',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'event_type' => 'event type',
            'date_from' => 'start date',
            'date_to' => 'end date',
            'per_page' => 'items per page',
            'sort_by' => 'sort field',
            'sort_direction' => 'sort direction',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'event_type.in' => 'Event type must be one of: party, festival, wellness, general',
            'urgency.in' => 'Urgency must be one of: today, tomorrow, weekend, this_week, this_month, future',
            'date_to.after_or_equal' => 'End date must be after or equal to start date',
            'per_page.max' => 'Maximum 100 items per page allowed',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert comma-separated keywords to array
        if ($this->has('keywords') && is_string($this->keywords)) {
            $this->merge([
                'keywords' => array_filter(array_map('trim', explode(',', $this->keywords)))
            ]);
        }

        // Set default values
        $this->mergeIfMissing([
            'per_page' => 20,
            'sort_by' => 'event_date',
            'sort_direction' => 'asc',
        ]);
    }
}