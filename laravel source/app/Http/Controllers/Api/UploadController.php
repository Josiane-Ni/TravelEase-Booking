<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048', // 2 MB max
            ],
            'folder' => ['nullable', 'string', 'in:airlines,hotels,rooms'],
        ]);

        $file = $request->file('image');
        $folder = $request->input('folder', 'uploads');

        // Safe randomized filename with validated extension
        $ext = $file->getClientOriginalExtension();
        $safeName = Str::random(32) . '.' . strtolower($ext);

        $path = $file->storeAs("public/{$folder}", $safeName);
        $url = "/storage/{$folder}/{$safeName}";

        return response()->json([
            'data' => [
                'path' => $url,
                'filename' => $safeName,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ],
        ], 201);
    }
}
