<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t): void {
            $t->string('phone', 30)->nullable();
            $t->string('role', 20)->default('customer')->index();
            $t->string('status', 20)->default('active')->index();
            $t->timestamp('terms_accepted_at')->nullable();
        });
        Schema::create('wallets', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->restrictOnDelete();
            $t->unsignedBigInteger('balance_minor')->default(0);
            $t->string('currency', 3)->default('USD');
            $t->timestamps();
        });
        Schema::create('loyalty_accounts', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->restrictOnDelete();
            $t->unsignedBigInteger('points')->default(0);
            $t->timestamps();
        });
        Schema::create('airlines', function (Blueprint $t): void {
            $t->id();
            $t->string('name');
            $t->string('code', 3)->unique();
            $t->string('logo_path')->nullable();
            $t->timestamps();
        });
        Schema::create('flights', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('airline_id')->constrained()->restrictOnDelete();
            $t->string('flight_number', 12)->unique();
            $t->string('origin', 80)->index();
            $t->string('destination', 80)->index();
            $t->dateTime('departure_at')->index();
            $t->dateTime('arrival_at');
            $t->string('status', 20)->default('scheduled')->index();
            $t->unsignedInteger('cancellation_hours')->default(24);
            $t->unsignedSmallInteger('cancellation_fee_percent')->default(10);
            $t->timestamps();
        });
        Schema::create('flight_classes', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('flight_id')->constrained()->restrictOnDelete();
            $t->string('name', 30);
            $t->unsignedBigInteger('fare_minor');
            $t->unsignedBigInteger('tax_minor')->default(0);
            $t->unique(['flight_id', 'name']);
            $t->timestamps();
        });
        Schema::create('inventory_holds', function (Blueprint $t): void {
            $t->id();
            $t->uuid('reference')->unique();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('flight_class_id')->constrained()->restrictOnDelete();
            $t->unsignedSmallInteger('quantity');
            $t->string('status', 20)->default('active')->index();
            $t->dateTime('expires_at')->index();
            $t->timestamps();
        });
        Schema::create('bookings', function (Blueprint $t): void {
            $t->id();
            $t->string('reference', 30)->unique();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->string('status', 20)->default('confirmed')->index();
            $t->string('type', 20)->default('flight');
            $t->string('destination');
            $t->dateTime('travel_at')->index();
            $t->unsignedBigInteger('subtotal_minor');
            $t->unsignedBigInteger('tax_minor');
            $t->unsignedBigInteger('total_minor');
            $t->string('currency', 3)->default('USD');
            $t->json('cancellation_policy');
            $t->timestamps();
        });
        Schema::create('flight_seats', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('flight_class_id')->constrained()->restrictOnDelete();
            $t->string('number', 6);
            $t->foreignId('inventory_hold_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('booking_id')->nullable()->constrained()->restrictOnDelete();
            $t->unique(['flight_class_id', 'number']);
            $t->timestamps();
        });
        Schema::create('booking_items', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('booking_id')->constrained()->restrictOnDelete();
            $t->foreignId('flight_class_id')->constrained()->restrictOnDelete();
            $t->unsignedSmallInteger('quantity');
            $t->unsignedBigInteger('unit_fare_minor');
            $t->unsignedBigInteger('unit_tax_minor');
            $t->json('snapshot');
            $t->timestamps();
        });
        Schema::create('booking_passengers', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('booking_id')->constrained()->restrictOnDelete();
            $t->string('name', 100);
            $t->string('type', 20)->default('adult');
            $t->timestamps();
        });
        Schema::create('booking_seats', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('booking_id')->constrained()->restrictOnDelete();
            $t->foreignId('flight_seat_id')->constrained()->restrictOnDelete();
            $t->unique(['booking_id', 'flight_seat_id']);
        });
        Schema::create('booking_status_history', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('booking_id')->constrained()->restrictOnDelete();
            $t->string('status');
            $t->timestamp('created_at')->useCurrent();
        });
        Schema::create('payments', function (Blueprint $t): void {
            $t->id();
            $t->uuid('reference')->unique();
            $t->foreignId('booking_id')->unique()->constrained()->restrictOnDelete();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->string('method', 20);
            $t->string('status', 20)->default('successful')->index();
            $t->unsignedBigInteger('amount_minor');
            $t->string('currency', 3)->default('USD');
            $t->boolean('simulated')->default(true);
            $t->timestamps();
        });
        Schema::create('payment_attempts', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('inventory_hold_id')->nullable()->constrained()->restrictOnDelete();
            $t->string('status', 20);
            $t->string('reason')->nullable();
            $t->timestamps();
        });
        Schema::create('wallet_transactions', function (Blueprint $t): void {
            $t->id();
            $t->uuid('reference')->unique();
            $t->foreignId('wallet_id')->constrained()->restrictOnDelete();
            $t->foreignId('booking_id')->nullable()->constrained()->restrictOnDelete();
            $t->string('type', 20);
            $t->bigInteger('amount_minor');
            $t->unsignedBigInteger('balance_after_minor');
            $t->timestamps();
        });
        Schema::create('loyalty_transactions', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('loyalty_account_id')->constrained()->restrictOnDelete();
            $t->foreignId('booking_id')->nullable()->constrained()->restrictOnDelete();
            $t->string('type', 20);
            $t->bigInteger('points');
            $t->unique(['booking_id', 'type']);
            $t->timestamps();
        });
        Schema::create('idempotency_keys', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->string('scope', 30);
            $t->string('key', 80);
            $t->string('payload_hash', 64);
            $t->json('response');
            $t->unique(['user_id', 'scope', 'key']);
            $t->timestamps();
        });
        Schema::create('cancellation_requests', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('booking_id')->unique()->constrained()->restrictOnDelete();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->string('status')->default('completed');
            $t->unsignedBigInteger('fee_minor');
            $t->timestamps();
        });
        Schema::create('refunds', function (Blueprint $t): void {
            $t->id();
            $t->uuid('reference')->unique();
            $t->foreignId('booking_id')->unique()->constrained()->restrictOnDelete();
            $t->foreignId('payment_id')->unique()->constrained()->restrictOnDelete();
            $t->unsignedBigInteger('amount_minor');
            $t->string('status')->default('completed');
            $t->timestamps();
        });
        Schema::create('travel_documents', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('booking_id')->constrained()->restrictOnDelete();
            $t->string('name');
            $t->boolean('available')->default(false);
            $t->unique(['booking_id', 'name']);
            $t->timestamps();
        });
        Schema::create('notifications', function (Blueprint $t): void {
            $t->uuid('id')->primary();
            $t->string('type');
            $t->morphs('notifiable');
            $t->text('data');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
        });
        Schema::create('audit_logs', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('actor_id')->nullable()->constrained('users')->restrictOnDelete();
            $t->string('action')->index();
            $t->string('resource')->nullable();
            $t->unsignedBigInteger('resource_id')->nullable();
            $t->json('metadata')->nullable();
            $t->timestamps();
        });
        Schema::create('corporate_clients', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('agent_id')->constrained('users')->restrictOnDelete();
            $t->string('name');
            $t->string('contact_email');
            $t->string('phone', 30)->nullable();
            $t->timestamps();
        });
        Schema::create('agent_commissions', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('agent_id')->constrained('users')->restrictOnDelete();
            $t->foreignId('booking_id')->unique()->constrained()->restrictOnDelete();
            $t->unsignedBigInteger('amount_minor');
            $t->string('status', 20)->default('pending');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['agent_commissions', 'corporate_clients', 'audit_logs', 'notifications', 'travel_documents', 'refunds', 'cancellation_requests', 'idempotency_keys', 'loyalty_transactions', 'wallet_transactions', 'payment_attempts', 'payments', 'booking_status_history', 'booking_seats', 'booking_passengers', 'booking_items', 'flight_seats', 'bookings', 'inventory_holds', 'flight_classes', 'flights', 'airlines', 'loyalty_accounts', 'wallets'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', function (Blueprint $t): void {
            $t->dropIndex(['role']);
            $t->dropIndex(['status']);
            $t->dropColumn(['phone', 'role', 'status', 'terms_accepted_at']);
        });
    }
};
