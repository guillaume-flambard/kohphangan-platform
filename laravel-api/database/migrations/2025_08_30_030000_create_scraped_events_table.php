<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('scraped_events', function (Blueprint $table) {
            $table->id();
            $table->string('channel');
            $table->text('raw_message');
            $table->date('event_date')->nullable();
            $table->string('location')->nullable();
            $table->enum('event_type', ['party', 'festival', 'wellness', 'general'])->default('general');
            $table->text('description');
            $table->json('keywords_found');
            $table->json('urls');
            $table->json('mentions');
            $table->timestamp('date_posted');
            $table->timestamps();
            
            $table->index(['channel', 'date_posted']);
            $table->index(['event_date']);
            $table->index(['event_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('scraped_events');
    }
};