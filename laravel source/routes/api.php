<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\FraudController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function (): void {
    Route::middleware('throttle:auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('verify-email-otp', [AuthController::class, 'verifyOtp']);
        Route::post('resend-verification-otp', [AuthController::class, 'resendOtp']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgot']);
        Route::post('reset-password', [AuthController::class, 'reset']);
    });

    Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:auth');

    // Flights public
    Route::get('airlines', [FlightController::class, 'airlines']);
    Route::get('flights', [FlightController::class, 'index']);
    Route::get('flights/{flight}', [FlightController::class, 'show']);
    Route::get('flights/{flight}/availability', [FlightController::class, 'availability']);

    // Hotels public
    Route::get('hotels', [HotelController::class, 'index']);
    Route::get('hotels/{hotel}', [HotelController::class, 'show']);
    Route::get('hotels/{hotel}/availability', [HotelController::class, 'availability']);

    // Packages public
    Route::get('packages', [PackageController::class, 'index']);
    Route::get('packages/{package}', [PackageController::class, 'show']);
    Route::post('packages/{package}/customize', [PackageController::class, 'customize']);

    // Promotions public validation
    Route::post('promotions/validate', [PromotionController::class, 'validatePromo']);

    // Protected API
    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::put('profile', [AuthController::class, 'profile']);
        Route::put('password', [AuthController::class, 'password']);

        // Uploads
        Route::post('upload', [UploadController::class, 'upload']);

        // Dashboards
        Route::get('customer/dashboard', [DashboardController::class, 'customer'])->middleware('role:customer');

        // Accounts & Wallet
        Route::get('wallet', [AccountController::class, 'wallet']);
        Route::get('wallet/transactions', [AccountController::class, 'wallet']);
        Route::post('wallet/top-up', [AccountController::class, 'topUp'])->middleware('throttle:checkout');
        Route::get('loyalty', [AccountController::class, 'loyalty']);
        Route::get('payments', [AccountController::class, 'payments']);
        Route::get('refunds', [AccountController::class, 'refunds']);
        Route::get('notifications', [AccountController::class, 'notifications']);
        Route::post('notifications/read-all', [AccountController::class, 'readAll']);
        Route::patch('notifications/{notification}/read', [AccountController::class, 'read']);

        // Checkout & Bookings
        Route::post('checkout/quote', [CheckoutController::class, 'quote']);
        Route::post('checkout/holds', [CheckoutController::class, 'hold'])->middleware('throttle:checkout');
        Route::delete('checkout/holds/{hold}', [CheckoutController::class, 'release']);
        Route::post('checkout/confirm', [CheckoutController::class, 'confirm'])->middleware('throttle:checkout');
        Route::post('bookings/{booking}/cancellation-quote', [CheckoutController::class, 'cancellationQuote']);
        Route::post('bookings/{booking}/cancel', [CheckoutController::class, 'cancel']);
        Route::patch('bookings/{booking}/documents/{document}', [CheckoutController::class, 'document']);

        Route::get('bookings', [CheckoutController::class, 'index']);
        Route::get('bookings/{booking}', [CheckoutController::class, 'show']);
        Route::get('bookings/{booking}/itinerary', [CheckoutController::class, 'show']);
        Route::get('bookings/{booking}/itinerary/pdf', [CheckoutController::class, 'pdf']);

        // Admin Management
        Route::prefix('admin')->middleware('role:admin')->group(function (): void {
            Route::get('dashboard', [DashboardController::class, 'admin']);
            Route::post('test-notification', [AdminController::class, 'testNotification']);
            Route::get('users', [AdminController::class, 'users']);
            Route::put('users/{user}', [AdminController::class, 'updateUser']);

            // Flight admin
            Route::get('flights', [AdminController::class, 'flights']);
            Route::post('airlines', [AdminController::class, 'airline']);
            Route::post('flights', [FlightController::class, 'store']);
            Route::put('flights/{flight}', [FlightController::class, 'update']);
            Route::delete('flights/{flight}', [FlightController::class, 'destroy']);

            // Hotel admin
            Route::get('hotels', [HotelController::class, 'adminIndex']);
            Route::post('hotels', [HotelController::class, 'store']);
            Route::put('hotels/{hotel}', [HotelController::class, 'update']);
            Route::delete('hotels/{hotel}', [HotelController::class, 'destroy']);
            Route::post('hotels/{hotel}/rooms', [HotelController::class, 'storeRoomType']);

            // Package admin
            Route::get('packages', [PackageController::class, 'adminIndex']);
            Route::post('packages', [PackageController::class, 'store']);
            Route::put('packages/{package}', [PackageController::class, 'update']);
            Route::delete('packages/{package}', [PackageController::class, 'destroy']);

            // Promotion admin
            Route::get('promotions', [PromotionController::class, 'index']);
            Route::post('promotions', [PromotionController::class, 'store']);
            Route::put('promotions/{promotion}', [PromotionController::class, 'update']);
            Route::delete('promotions/{promotion}', [PromotionController::class, 'destroy']);

            // Fraud Monitoring
            Route::get('fraud', [FraudController::class, 'index']);
            Route::put('fraud/{flag}', [FraudController::class, 'update']);
            Route::post('fraud/scan', [FraudController::class, 'scan']);

            // Audit & Reports
            Route::get('audit-logs', [AdminController::class, 'audit']);
            Route::get('reports/export', [AdminController::class, 'export']);
            Route::get('reports/overview', [AdminController::class, 'reportsOverview']);
            Route::get('reports/pdf', [AdminController::class, 'exportPdf']);
        });

        // Travel Agent Portal
        Route::prefix('agent')->middleware('role:agent')->group(function (): void {
            Route::get('dashboard', [DashboardController::class, 'agent']);
            Route::get('clients', [AdminController::class, 'clients']);
            Route::post('clients', [AdminController::class, 'saveClient']);
            Route::put('clients/{client}', [AdminController::class, 'saveClient']);
        });
    });
});
