#!/bin/sh
set -e

# Parsear DATABASE_URL de Railway si está disponible
# Formato: postgresql://user:password@host:port/database
if [ -n "$DATABASE_URL" ]; then
    export DB_CONNECTION=pgsql
    export DB_USERNAME=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
    export DB_PASSWORD=$(echo "$DATABASE_URL" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')
    export DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:]+):.*|\1|')
    export DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*@[^:]+:([0-9]+)/.*|\1|')
    export DB_DATABASE=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')
fi

# Limpiar caches de desarrollo
rm -f bootstrap/cache/packages.php \
      bootstrap/cache/services.php \
      bootstrap/cache/config.php \
      bootstrap/cache/routes*.php \
      bootstrap/cache/events.php 2>/dev/null || true

# Validar APP_KEY
if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY no está configurado."
    echo "Genera uno con: php -r \"echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;\""
    exit 1
fi

# Crear directorios necesarios
mkdir -p storage/framework/{views,cache/data,sessions} \
         storage/logs \
         storage/app/public \
         /var/log/nginx \
         /var/lib/nginx/tmp
chown -R www-data:www-data storage bootstrap/cache
chmod -R 777 storage

# Validar configuración de nginx
nginx -t 2>&1 || { echo "ERROR: nginx config inválida"; exit 1; }

# Esperar a la base de datos
echo "==> Esperando base de datos..."
until php -r "
try {
    new PDO(
        'pgsql:host=${DB_HOST};port=${DB_PORT:-5432};dbname=${DB_DATABASE}',
        '${DB_USERNAME}',
        '${DB_PASSWORD}'
    );
    exit(0);
} catch (Exception \$e) { exit(1); }
" 2>/dev/null; do
    printf '.'
    sleep 2
done
echo ""

php artisan migrate --force
php artisan db:seed --class=RoleSeeder --force
php artisan storage:link --force 2>/dev/null || true
php artisan config:cache
php artisan route:cache

echo "==> Listo. Iniciando servicios..."
exec "$@"
