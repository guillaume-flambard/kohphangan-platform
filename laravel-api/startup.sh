#!/bin/bash
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL connection..."
while ! php artisan migrate:status 2>/dev/null; do
    echo "MySQL not ready, waiting 5 seconds..."
    sleep 5
done

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Start Apache
echo "Starting Apache server..."
exec apache2-foreground