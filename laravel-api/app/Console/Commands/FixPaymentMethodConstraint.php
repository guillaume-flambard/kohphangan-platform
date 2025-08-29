<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FixPaymentMethodConstraint extends Command
{
    protected $signature = 'fix:payment-constraint';
    protected $description = 'Fix payment method constraint to allow omise';

    public function handle()
    {
        $this->info('Fixing payment method constraint...');

        try {
            // For SQLite, we need to recreate the table
            if (DB::getDriverName() === 'sqlite') {
                $this->info('Detected SQLite database');

                // Get existing data
                $existingTickets = DB::table('tickets')->get()->toArray();
                $this->info('Found ' . count($existingTickets) . ' existing tickets');

                // Create new table with correct constraint
                Schema::create('tickets_new', function ($table) {
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

                $this->info('Created new table with correct constraints');

                // Copy existing cash tickets only (skip tab tickets)
                foreach ($existingTickets as $ticket) {
                    $ticketArray = (array) $ticket;
                    if ($ticketArray['payment_method'] === 'cash') {
                        DB::table('tickets_new')->insert($ticketArray);
                        $this->info('Migrated cash ticket: ' . $ticketArray['ticket_number']);
                    } else {
                        $this->warn('Skipped ' . $ticketArray['payment_method'] . ' ticket: ' . $ticketArray['ticket_number']);
                    }
                }

                // Drop old table and rename new one
                Schema::drop('tickets');
                Schema::rename('tickets_new', 'tickets');

                $this->info('Database schema updated successfully!');
                return 0;
            } else {
                // For MySQL/PostgreSQL
                DB::statement("ALTER TABLE tickets MODIFY payment_method ENUM('cash', 'omise') DEFAULT 'omise'");
                $this->info('Updated payment method constraint for non-SQLite database');
                return 0;
            }
        } catch (\Exception $e) {
            $this->error('Failed to fix payment constraint: ' . $e->getMessage());
            return 1;
        }
    }
}