#!/bin/sh
set -e

# Remove any stale dev caches copied from the host during build
rm -f /var/www/html/bootstrap/cache/packages.php \
      /var/www/html/bootstrap/cache/services.php \
      /var/www/html/bootstrap/cache/config.php \
      /var/www/html/bootstrap/cache/routes*.php \
      /var/www/html/bootstrap/cache/events.php 2>/dev/null || true

# Validate required env vars early
if [ -z "$APP_KEY" ]; then
    echo ""
    echo "ERROR: APP_KEY is not set in .env.docker"
    echo "Generate one with:"
    echo "  docker compose run --rm --no-deps app php artisan key:generate --show"
    echo "Then paste it in .env.docker as APP_KEY=base64:..."
    echo ""
    exit 1
fi

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-mapbuilder_db}"
DB_USERNAME="${DB_USERNAME:-mapbuilder}"
DB_PASSWORD="${DB_PASSWORD:-secret}"

# Ensure required storage directories exist (volume starts empty on first run)
mkdir -p /var/www/html/storage/framework/{views,cache/data,sessions} \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 777 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

echo "==> Waiting for database at ${DB_HOST}:${DB_PORT}..."
until php -r "
try {
    new PDO(
        'pgsql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}',
        '${DB_USERNAME}',
        '${DB_PASSWORD}'
    );
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    printf '.'
    sleep 2
done
echo ""
echo "==> Database ready."

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Seeding roles..."
php artisan db:seed --class=RoleSeeder --force

echo "==> Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Caching config and routes..."
php artisan config:cache
php artisan route:cache

echo "==> Starting PHP-FPM..."
exec "$@"
