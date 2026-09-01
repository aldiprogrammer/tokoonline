#!/bin/bash
set -e

APP_DIR="/home/u107214145/domains/fabricoasia.com/tokoonline"
WEB_DIR="/home/u107214145/domains/fabricoasia.com/public_html"
BRANCH="main"

cd "$APP_DIR"

echo "==> Update dari Git"
git fetch origin
git reset --hard "origin/$BRANCH"

echo "==> Install dependency PHP"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Clear cache Laravel"
php artisan optimize:clear

echo "==> Cache Laravel"
php artisan config:cache
# php artisan route:cache
php artisan view:cache

if command -v npm >/dev/null 2>&1; then
  echo "==> Build Vite"
  npm ci
  npm run build
else
  echo "==> npm tidak tersedia, skip build"
fi

echo "==> Sync public ke public_html"
rsync -av --delete \
  --exclude='index.php' \
  "$APP_DIR/public/" "$WEB_DIR/"

echo "==> Pastikan index.php custom tetap aman"
cat > "$WEB_DIR/index.php" <<'PHP'
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__.'/../tokoonline/vendor/autoload.php';
$app = require_once __DIR__.'/../tokoonline/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
PHP

echo "==> Selesai"