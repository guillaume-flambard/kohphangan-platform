<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->string('event_name')->default('Waterfall Party Echo');
            $table->string('attendee_name');
            $table->string('attendee_email');
            $table->string('attendee_phone')->nullable();
            $table->decimal('price', 8, 2);
            $table->string('currency', 3)->default('THB');
            $table->enum('payment_method', ['tab', 'cash'])->default('tab');
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('tab_payment_id')->nullable();
            $table->text('qr_code');
            $table->enum('status', ['active', 'used', 'cancelled'])->default('active');
            $table->timestamps();
            
            $table->index(['attendee_email']);
            $table->index(['payment_status']);
            $table->index(['ticket_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};