<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'], 'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://127.0.0.1:5175'),
        'http://127.0.0.1:8000',
        'http://localhost:8000',
        'http://127.0.0.1:5175',
        'http://localhost:5175',
    ], 'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'Accept', 'X-Requested-With', 'X-XSRF-TOKEN', 'Idempotency-Key'],
    'exposed_headers' => ['Content-Disposition'], 'max_age' => 0, 'supports_credentials' => true,
];
