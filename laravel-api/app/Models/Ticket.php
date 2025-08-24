<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'event_name',
        'attendee_name',
        'attendee_email',
        'attendee_phone',
        'price',
        'currency',
        'payment_method',
        'payment_status',
        'tab_payment_id',
        'qr_code',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function generateTicketNumber()
    {
        return 'WFP-' . date('Y') . '-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    public function generateQRCode()
    {
        return 'WATERFALL-' . $this->ticket_number . '-' . md5($this->attendee_email . $this->created_at);
    }
}