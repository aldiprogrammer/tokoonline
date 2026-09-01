#!/bin/bash

set -e

# =========================================================
# KONFIGURASI
# =========================================================

APP_DIR="/home/u107214145/domains/fabricoasia.com/tokoonline"
WEB_DIR="/home/u107214145/domains/fabricoasia.com/public_html"
BRANCH="main"

# =========================================================
# MASUK KE FOLDER PROJECT
# =========================================================

echo ""
echo "=========================================="
echo "       DEPLOY LARAVEL"
echo "=========================================="
echo ""

cd "$APP_DIR"

echo "==> Folder project:"
pwd

# =========================================================
# UPDATE CODE DARI GITHUB
# =========================================================

echo ""
echo "==> Update dari GitHub..."

git fetch origin
git reset --hard "origin/$BRANCH"

# =========================================================
# INSTALL DEPENDENCY PHP
# =========================================================

echo ""
echo "==> Install dependency PHP..."

composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# =========================================================
# CLEAR CACHE LARAVEL
# =========================================================

echo ""
echo "==> Clear cache Laravel..."

php artisan optimize:clear

# =========================================================
# CACHE LARAVEL
# =========================================================

echo ""
echo "==> Cache config Laravel..."

php artisan config:cache

echo ""
echo "==> Cache view Laravel..."

php artisan view:cache

# =========================================================
# BUILD VITE / REACT
# =========================================================

if command -v npm >/dev/null 2>&1; then

    echo ""
    echo "==> Node.js ditemukan:"
    node -v

    echo ""
    echo "==> NPM ditemukan:"
    npm -v

    echo ""
    echo "==> Install dependency NPM..."

    npm ci

    echo ""
    echo "==> Build Vite..."

    npm run build

else

    echo ""
    echo "WARNING: npm tidak tersedia."
    echo "Build Vite dilewati."

fi

# =========================================================
# PASTIKAN STORAGE DIRECTORY ADA
# =========================================================

echo ""
echo "==> Memastikan storage Laravel..."

mkdir -p "$APP_DIR/storage/app/public"

# =========================================================
# SYNC PUBLIC LARAVEL KE PUBLIC_HTML
# =========================================================

echo ""
echo "==> Sync public Laravel ke public_html..."

rsync -av --delete \
    --exclude='index.php' \
    --exclude='storage' \
    "$APP_DIR/public/" \
    "$WEB_DIR/"

# =========================================================
# BUAT STORAGE LINK
# =========================================================

echo ""
echo "==> Membuat symbolic link storage..."

# Hapus storage lama jika ada
if [ -L "$WEB_DIR/storage" ]; then

    echo "==> Menghapus symbolic link storage lama..."

    rm "$WEB_DIR/storage"

elif [ -d "$WEB_DIR/storage" ]; then

    echo "==> Menghapus folder storage lama..."

    rm -rf "$WEB_DIR/storage"

fi

# Buat symbolic link baru
ln -s \
    "$APP_DIR/storage/app/public" \
    "$WEB_DIR/storage"

echo "==> Storage link berhasil dibuat."

# =========================================================
# BUAT INDEX.PHP
# =========================================================

echo ""
echo "==> Membuat index.php..."

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

# =========================================================
# PERMISSION
# =========================================================

echo ""
echo "==> Mengatur permission storage..."

chmod -R 775 "$APP_DIR/storage"
chmod -R 775 "$APP_DIR/bootstrap/cache"

# =========================================================
# CEK STORAGE LINK
# =========================================================

echo ""
echo "==> Mengecek storage link..."

if [ -L "$WEB_DIR/storage" ]; then

    echo "SUCCESS: storage link aktif."

    ls -la "$WEB_DIR/storage"

else

    echo "ERROR: storage link gagal dibuat."

    exit 1

fi

# =========================================================
# CEK INDEX.PHP
# =========================================================

if [ -f "$WEB_DIR/index.php" ]; then

    echo ""
    echo "SUCCESS: index.php tersedia."

else

    echo ""
    echo "ERROR: index.php tidak ditemukan."

    exit 1

fi

# =========================================================
# SELESAI
# =========================================================

echo ""
echo "=========================================="
echo "       DEPLOY BERHASIL"
echo "=========================================="
echo ""

echo "Project : $APP_DIR"
echo "Website : $WEB_DIR"
echo "Branch  : $BRANCH"

echo ""
echo "Storage:"
echo "$WEB_DIR/storage -> $APP_DIR/storage/app/public"

echo ""
echo "=========================================="