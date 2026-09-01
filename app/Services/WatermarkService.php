<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class WatermarkService
{
    public const TEXT = 'Fabrico';

    public static function apply(UploadedFile $file, string $disk = 'public', string $dir = 'produk'): string
    {
        $image = static::createImage($file);
        $width = imagesx($image);
        $height = imagesy($image);

        $font = base_path('resources/fonts/DejaVuSans-Bold.ttf');
        $fontSize = max(18, (int) round($width * 0.045));

        $box = imagettfbbox($fontSize, 0, $font, static::TEXT);
        $textWidth = abs($box[2] - $box[0]);
        $textHeight = abs($box[7] - $box[1]);

        $color = imagecolorallocatealpha($image, 255, 255, 255, 70);
        $padding = max(15, (int) round($width * 0.03));
        $x = $width - $textWidth - $padding;
        $y = $height - $padding;

        imagettftext($image, $fontSize, 0, $x, $y, $color, $font, static::TEXT);

        $extension = strtolower($file->getClientOriginalExtension());
        $tmp = tempnam(sys_get_temp_dir(), 'wm_') . '.' . $extension;
        static::saveImage($image, $tmp, $extension);
        imagedestroy($image);

        $path = Storage::disk($disk)->putFile($dir, new \Illuminate\Http\File($tmp));
        @unlink($tmp);

        return $path;
    }

    private static function createImage(UploadedFile $file)
    {
        $mime = $file->getMimeType();

        if (!in_array($mime, ['image/jpeg', 'image/png'])) {
            abort(422, 'Format gambar tidak didukung.');
        }

        $image = imagecreatefromstring($file->get());

        if ($image === false) {
            abort(422, 'Gagal memproses gambar.');
        }

        return $image;
    }

    private static function saveImage($image, string $path, string $extension): void
    {
        if ($extension === 'png') {
            imagepng($image, $path);
        } else {
            imagejpeg($image, $path, 92);
        }
    }
}
