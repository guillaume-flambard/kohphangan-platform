# Laravel API Dockerfile for Cloud Run
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock /var/www/html/

# Install Laravel dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev --verbose

# Copy the rest of the application and preserve vendor directory
COPY . /var/www/html
RUN rm -rf /var/www/html/vendor /var/www/html/composer.lock
COPY composer.json composer.lock /var/www/html/

# Reinstall dependencies to ensure vendor directory is correct
RUN composer install --no-interaction --optimize-autoloader --no-dev
# Create required directories and set permissions
RUN mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Generate application key
RUN php artisan key:generate --no-interaction || true

# Skip config cache for now to avoid DB connection issues during build
# RUN php artisan config:cache || true

# Configure Apache to listen on port 8080
RUN sed -i 's/Listen 80/Listen 8080/g' /etc/apache2/ports.conf

# Create Apache virtual host configuration
RUN echo '<VirtualHost *:8080>' > /etc/apache2/sites-available/000-default.conf && \
    echo '    DocumentRoot /var/www/html/public' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    <Directory /var/www/html/public>' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        AllowOverride All' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/000-default.conf && \
    echo '</VirtualHost>' >> /etc/apache2/sites-available/000-default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start Apache
CMD ["apache2-foreground"]