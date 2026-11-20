<?php

use Illuminate\Support\Facades\Route;

Route::get('/hello', fn () => 'Hello Frederic! My first Laravel page.');

Route::get('/', function () {
    if (app()->environment('testing')) {
        return redirect(config('travelease.frontend_url'));
    }
    if (file_exists(public_path('index.html'))) {
        return response()->file(public_path('index.html'), [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
    return response('TravelEase frontend assets not found in public/index.html. Please run npm run build in travelease-frontend and copy to public.', 503);
});

Route::get('/{any}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
    return response('TravelEase frontend assets not found in public/index.html. Please run npm run build in travelease-frontend and copy to public.', 503);
})->where('any', '^(?!api|sanctum|up).*$');
