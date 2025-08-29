<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // For SQLite, we need to recreate the table to modify enum constraint
        if (DB::getDriverName() === 'sqlite') {
            // Create temporary table with new constraint
            Schema::create('tickets_temp', function (Blueprint $table) {
                $table->id();
                $table->string('ticket_number')->unique();
                $table->string('event_name')->default('Waterfall Party Echo');
                $table->string('attendee_name');
                $table->string('attendee_email');
                $table->string('attendee_phone')->nullable();
                $table->decimal('price', 8, 2);
                $table->string('currency', 3)->default('THB');
                $table->enum('payment_method', ['cash', 'omise'])->default('omise');
                $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
                $table->string('tab_payment_id')->nullable();
                $table->text('qr_code');
                $table->enum('status', ['active', 'used', 'cancelled'])->default('active');
                $table->timestamps();

                $table->index(['attendee_email']);
                $table->index(['payment_status']);
                $table->index(['ticket_number']);
            });

            // Copy existing data
            DB::statement('INSERT INTO tickets_temp SELECT * FROM tickets');

            // Drop old table and rename temp table
            Schema::drop('tickets');
            Schema::rename('tickets_temp', 'tickets');
        } else {
            // For other databases, use ALTER TABLE
            DB::statement("ALTER TABLE tickets MODIFY payment_method ENUM('cash', 'omise') DEFAULT 'omise'");
        }
    }

    public function down(): void
    {
        // Revert back to original constraint
        if (DB::getDriverName() === 'sqlite') {
            Schema::create('tickets_temp', function (Blueprint $table) {
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

            DB::statement('INSERT INTO tickets_temp SELECT * FROM tickets WHERE payment_method IN ("tab", "cash")');
            Schema::drop('tickets');
            Schema::rename('tickets_temp', 'tickets');
        } else {
            DB::statement("ALTER TABLE tickets MODIFY payment_method ENUM('tab', 'cash') DEFAULT 'tab'");
        }
    }
};